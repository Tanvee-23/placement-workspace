/**
 * Shared utility to call the Vite dev server Gemini API proxy.
 * Used by CompanyQuiz and CompanyMockInterview components.
 *
 * Falls back gracefully when the API key is missing or the server is unreachable,
 * returning { success: false, fallback: true } so components can degrade to
 * rule-based content.
 */

/**
 * Sends a prompt to the /api/quiz endpoint and returns the parsed response.
 * @param {string} systemPrompt - The system instruction for Gemini.
 * @param {string} userPrompt - The user-facing prompt.
 * @returns {Promise<{ success: boolean, data?: string, fallback?: boolean }>}
 */
async function callQuizApi(systemPrompt, userPrompt) {
  try {
    const response = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userPrompt })
    });

    const result = await response.json();

    if (result.error === 'MISSING_API_KEY' || result.error) {
      return { success: false, fallback: true, message: result.message || '' };
    }

    return { success: true, data: result.reply || '' };
  } catch (err) {
    return { success: false, fallback: true, message: err.message };
  }
}

/**
 * Generate quiz questions for a specific company and role.
 * Returns parsed JSON array of questions or null on failure.
 */
export async function generateQuizQuestions(companyName, role) {
  const systemPrompt = `You are an expert placement preparation quiz generator. Generate placement preparation quiz questions that would be asked during ${companyName}'s recruitment process for a ${role} position. Return ONLY a valid JSON array, no markdown, no code fences, no explanation.`;

  const userPrompt = `Generate exactly 10 multiple-choice placement preparation questions for ${companyName} hiring a ${role}. Include a mix of:
- 3 aptitude/logical reasoning questions
- 4 technical questions relevant to the ${role} role
- 3 company-specific and role-relevant questions

Return ONLY a JSON array with this exact structure (no extra text):
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this is the correct answer.",
    "category": "Technical"
  }
]

Categories should be one of: "Aptitude", "Technical", or "Role-Specific".
correctIndex is 0-based index of the correct option.`;

  const result = await callQuizApi(systemPrompt, userPrompt);

  if (!result.success) {
    return null;
  }

  try {
    // Try to extract JSON from the response (handle possible markdown wrapping)
    let jsonStr = result.data.trim();
    // Strip markdown code fences if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate interview questions for a specific company and role.
 * Returns parsed JSON array of questions or null on failure.
 */
export async function generateInterviewQuestions(companyName, role) {
  const systemPrompt = `You are an expert technical interviewer at ${companyName}. Generate realistic interview questions for a ${role} candidate. Return ONLY a valid JSON array, no markdown, no code fences, no explanation.`;

  const userPrompt = `Generate exactly 5 interview questions that ${companyName} would ask a ${role} candidate. Include a mix of:
- 1 behavioral/HR question
- 2 technical questions specific to the role
- 1 system design or problem-solving question
- 1 company-culture or situational question

Return ONLY a JSON array with this exact structure (no extra text):
[
  {
    "id": 1,
    "question": "Question text here?",
    "category": "Technical",
    "tips": "Brief tip on what a good answer should cover."
  }
]

Categories should be one of: "Behavioral", "Technical", "System Design", "Situational".`;

  const result = await callQuizApi(systemPrompt, userPrompt);

  if (!result.success) {
    return null;
  }

  try {
    let jsonStr = result.data.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Evaluate interview answers using AI.
 * Returns parsed JSON feedback or null on failure.
 */
export async function evaluateInterviewAnswers(companyName, role, questionsAndAnswers) {
  const systemPrompt = `You are a senior technical interviewer at ${companyName} evaluating a ${role} candidate's interview responses. Provide honest, constructive, and actionable feedback. Return ONLY a valid JSON object, no markdown, no code fences, no explanation.`;

  const qaFormatted = questionsAndAnswers.map((qa, i) =>
    `Question ${i + 1} (${qa.category}): ${qa.question}\nCandidate's Answer: ${qa.answer || '(No answer provided)'}`
  ).join('\n\n');

  const userPrompt = `Evaluate the following interview responses for a ${role} position at ${companyName}:

${qaFormatted}

Return ONLY a JSON object with this exact structure (no extra text):
{
  "overallScore": 7,
  "overallFeedback": "Overall assessment of the candidate's performance.",
  "questionFeedback": [
    {
      "questionId": 1,
      "score": 8,
      "strengths": "What the candidate did well.",
      "improvements": "Specific suggestions for improvement.",
      "sampleAnswer": "A brief ideal answer outline."
    }
  ]
}

overallScore and individual scores should be 1-10.`;

  const result = await callQuizApi(systemPrompt, userPrompt);

  if (!result.success) {
    return null;
  }

  try {
    let jsonStr = result.data.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
