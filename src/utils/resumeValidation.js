// Layered validation for the resume upload:
//   1. Basic checks  -> extension, size, empty file
//   2. Signature     -> first bytes of the file really match (catches renamed photos)
//   3. Content check -> extracted text actually looks like a resume

export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'heic', 'tif', 'tiff'];

export const NOT_RESUME_MESSAGE =
  'Not a valid resume file. Please upload your resume (a PDF, DOCX or TXT with your contact details and sections like Education, Skills, Projects or Experience).';

export const IMAGE_MESSAGE =
  'This looks like an image/photo, not a resume. Please upload your resume as a PDF, DOCX or TXT file.';

export function getExtension(fileName) {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

// Step 1
export function validateFileBasics(file) {
  const ext = getExtension(file.name);
  if (IMAGE_EXTENSIONS.includes(ext)) return { ok: false, message: IMAGE_MESSAGE };
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      ok: false,
      message: `Not a valid resume file (.${ext || 'unknown'}). Please upload your resume as a PDF, DOCX or TXT file.`
    };
  }
  if (file.size === 0) return { ok: false, message: 'This file is empty. Please upload your resume.' };
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, message: 'This file is larger than 5 MB. Please upload a smaller resume file.' };
  }
  return { ok: true, ext };
}

// Step 2: look at the first bytes (the "magic number") instead of trusting the extension
export async function sniffFileKind(file) {
  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const startsWith = (...sig) => sig.every((b, i) => bytes[i] === b);

  if (startsWith(0x25, 0x50, 0x44, 0x46)) return 'pdf'; // %PDF
  if (startsWith(0x50, 0x4b, 0x03, 0x04)) return 'zip'; // PK.. (docx is a zip)
  if (startsWith(0x89, 0x50, 0x4e, 0x47)) return 'image'; // PNG
  if (startsWith(0xff, 0xd8, 0xff)) return 'image'; // JPEG
  if (startsWith(0x47, 0x49, 0x46, 0x38)) return 'image'; // GIF
  if (startsWith(0x42, 0x4d)) return 'image'; // BMP
  if (startsWith(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45) return 'image'; // WEBP
  if (bytes.includes(0)) return 'binary'; // NUL byte => not plain text
  return 'text';
}

export function validateFileSignature(ext, kind) {
  if (kind === 'image') return { ok: false, message: IMAGE_MESSAGE };
  const expected = { pdf: 'pdf', docx: 'zip', txt: 'text' }[ext];
  if (kind !== expected) {
    return { ok: false, message: `This file's content doesn't match its .${ext} extension. ${NOT_RESUME_MESSAGE}` };
  }
  return { ok: true };
}

// Step 3
const HEADING_KEYWORDS = [
  'summary', 'objective', 'profile', 'about me', 'education', 'experience', 'work experience',
  'employment', 'internship', 'projects', 'skills', 'technical skills', 'certifications',
  'achievements', 'awards', 'extracurricular', 'coursework', 'languages'
];

export function validateResumeText(text) {
  const clean = (text || '').trim();
  const lower = clean.toLowerCase();
  const words = clean ? clean.split(/\s+/).length : 0;

  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(clean);
  const hasPhone = /\+?\d[\d\s().-]{8,}\d/.test(clean);
  const hasProfileLink = /linkedin\.com|github\.com/.test(lower);
  const hasContact = hasEmail || hasPhone || hasProfileLink;

  // headings = short lines that start with a resume keyword (e.g. "SKILLS", "Education:")
  const headingLines = clean.split(/\r?\n/).map((l) => l.trim().toLowerCase().replace(/[^a-z\s]/g, '').trim()).filter((l) => l && l.length <= 40);
  const headingHits = new Set(
    HEADING_KEYWORDS.filter((kw) => headingLines.some((l) => l === kw || l.startsWith(`${kw} `)))
  ).size;
  const looseHits = HEADING_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  const stats = { words, hasContact, headingHits, looseHits };

  if (words < 40) {
    return { valid: false, message: `${NOT_RESUME_MESSAGE} (Too little text was found in the file.)`, stats };
  }
  const looksLikeResume =
    (hasContact && headingHits >= 2) || headingHits >= 3 || (hasContact && looseHits >= 4);

  return looksLikeResume
    ? { valid: true, stats }
    : { valid: false, message: NOT_RESUME_MESSAGE, stats };
}