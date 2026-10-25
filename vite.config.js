import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

function callGemini(model, key, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent?key=${key}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        },
        timeout: 15000
      },
      (res) => {
        let body = '';
        res.on('data', (c) => {
          body += c;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body: { raw: body } });
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out'));
    });

    req.write(data);
    req.end();
  });
}

function chatApiPlugin() {
  const handler = async (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }

    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        const parsed = JSON.parse(rawBody || '{}');
        const messages = Array.isArray(parsed.messages) ? parsed.messages : [];

        // Dynamically load env so updates to .env don't require restarting Vite
        const env = { ...process.env, ...loadEnv('development', process.cwd(), '') };
        const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;

        if (!geminiKey) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(
            JSON.stringify({
              error: 'MISSING_API_KEY',
              message:
                'API key is not configured for live AI mentor responses. Add GEMINI_API_KEY to your .env file in the placement-workspace folder to activate real-time AI responses.',
              setupGuide: {
                provider: 'Google Gemini',
                envVar: 'GEMINI_API_KEY',
                url: 'https://aistudio.google.com/',
                instructions:
                  '1. Get a free API key from Google AI Studio (https://aistudio.google.com/).\n2. Create a .env file in placement-workspace/\n3. Add: GEMINI_API_KEY=your_actual_key_here\n4. Save the file and send your message again.'
              }
            })
          );
        }

        const SYSTEM_PROMPT = `You are the "Placement AI Mentor", an expert college placement preparation advisor and software engineering interview coach.
Your mission is to provide structured, practical, honest, and high-impact placement guidance for college students.

Key Domains:
1. DSA & Coding:
   - Topics: Arrays, Strings, Hashing, Two Pointers, Sliding Windows, Linked Lists, Stacks, Queues, Trees, Graphs, Recursion, Dynamic Programming, Complexity Analysis (Big-O time/space).
   - Beginner-friendly explanations with intuitive real-world analogies.
   - When requested or relevant, provide clean, idiomatic Java code with clear inline comments and edge-case handling.
   - Recommend targeted practice problems (e.g. LeetCode / GFG favorites) and explain solutions step-by-step (Brute Force -> Optimal -> Space/Time tradeoffs).

2. Core CS Subjects:
   - Topics: Object-Oriented Programming (OOP), Database Management Systems (DBMS & SQL queries/normalization/indexing), Operating Systems (Processes, Threads, Semaphores, Deadlocks, Paging), Computer Networks (TCP/IP, UDP, HTTP/HTTPS, DNS).
   - Provide clear, high-scoring technical interview answers and mock interview questions.

3. Placement & Company Preparation:
   - Tailored strategies for companies like Google, Amazon, Microsoft, and other tech companies.
   - Guidance on Online Assessments (OAs), Technical Interview rounds, System Design / LLD basics, HR / Behavioral rounds (using the STAR method).
   - Aptitude preparation, Resume optimization (ATS-friendly, quantified achievements), and standout portfolio projects.
   - Honest advice: Explain what to learn, why it matters, and exact next steps. Never falsely claim that a particular question will definitely appear.

4. Study Planning & Roadmaps:
   - Formulate realistic, actionable daily and weekly study routines without burnout.
   - Generate structured 7-day, 30-day, and 90-day roadmaps based on student timelines.
   - Help students prioritize topics based on current skill level, target roles, and remaining time.
   - Ask clarifying follow-up questions when helpful to customize guidance rather than giving generic answers.

Formatting: Use markdown formatting with clear headings, bullet points, and syntax-highlighted code blocks.`;

        // Format conversation history for Gemini API
        const contents = [];
        for (const m of messages) {
          const role = m.role === 'assistant' ? 'model' : 'user';
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += `\n\n${m.content}`;
          } else {
            contents.push({
              role,
              parts: [{ text: m.content }]
            });
          }
        }

        if (contents.length === 0 || contents[0].role !== 'user') {
          contents.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
        }

        const payload = {
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        };

        // Primary model: gemini-3.8-flash as specified by user
        // Fallback models if gemini-3.8-flash encounters high demand (503) or quota exhaustion (429)
        const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
        let geminiResult = null;
        let activeModel = '';

        for (const model of modelsToTry) {
          activeModel = model;
          try {
            const res = await callGemini(model, geminiKey, payload);
            if (res.status === 200) {
              geminiResult = res;
              break;
            } else if (res.status === 400) {
              // Invalid API key, don't try other models
              geminiResult = res;
              break;
            } else {
              geminiResult = res;
            }
          } catch (err) {
            geminiResult = { status: 500, body: { error: { message: err.message } } };
          }
        }

        if (!geminiResult || geminiResult.status !== 200) {
          const errorMsg =
            geminiResult?.body?.error?.message ||
            'Unable to generate response from Gemini API. Please check your API key.';

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(
            JSON.stringify({
              error: 'API_ERROR',
              message: `Gemini API error: ${errorMsg}`
            })
          );
        }

        let reply = '';
        const parts = geminiResult.body?.candidates?.[0]?.content?.parts;
        if (Array.isArray(parts)) {
          reply = parts
            .filter((p) => p.text)
            .map((p) => p.text)
            .join('\n\n');
        }

        if (!reply) {
          reply = 'No response generated.';
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ reply, model: activeModel }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({
            error: 'SERVER_ERROR',
            message: err.message || 'Internal server error processing chat request.'
          })
        );
      }
    });
  };

  return {
    name: 'placement-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/chat', handler);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), chatApiPlugin()]
});
