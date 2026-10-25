// Reads real text out of an uploaded resume (TXT, PDF, DOCX).

export async function extractTextFromFile(file, ext) {
  if (ext === 'txt') return file.text();
  if (ext === 'pdf') return extractPdfText(file);
  if (ext === 'docx') return extractDocxText(file);
  throw new Error('Unsupported file type.');
}

/* ---------------- PDF ---------------- */
async function extractPdfText(file) {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfToText(pdfjs, await file.arrayBuffer());
}

export async function pdfToText(pdfjs, arrayBuffer) {
  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  } catch {
    throw new Error('This PDF could not be read. It may be corrupted or password-protected.');
  }
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let out = '';
    for (const item of content.items) {
      out += item.str;
      out += item.hasEOL ? '\n' : ' ';
    }
    pages.push(out);
  }
  return pages.join('\n');
}

/* ---------------- DOCX ---------------- */
async function inflateRaw(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).arrayBuffer();
}

export async function extractDocxText(file) {
  const buf = await file.arrayBuffer();
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);
  const bad = () => new Error('This DOCX could not be read. Please re-save it as DOCX or PDF.');

  // 1. find End Of Central Directory record (signature 0x06054b50) scanning from the end
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw bad();

  const entries = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);

  // 2. walk the central directory looking for word/document.xml
  for (let n = 0; n < entries; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) throw bad();
    const method = view.getUint16(p + 10, true);
    const compSize = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const localOffset = view.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));

    if (name === 'word/document.xml') {
      const lhNameLen = view.getUint16(localOffset + 26, true);
      const lhExtraLen = view.getUint16(localOffset + 28, true);
      const start = localOffset + 30 + lhNameLen + lhExtraLen;
      const raw = bytes.subarray(start, start + compSize);
      const xmlBytes = method === 0 ? raw : await inflateRaw(raw);
      return wordXmlToText(new TextDecoder().decode(xmlBytes));
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error('This file is not a valid Word (.docx) document.');
}

export function wordXmlToText(xml) {
  return xml
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}