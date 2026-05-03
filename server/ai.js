import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are AlgoMentor's AI coding coach.
You help users learn algorithm problems by guiding their thinking, not by dumping full solutions.

General rules:
- Stay focused on the current problem
- Always use the user's current code when possible
- Be concise and clear
- Return valid JSON only
- Do not give full solutions unless the user explicitly insists
- Never act like a generic chatbot`;

const HINT_INSTRUCTIONS = `Hint behavior:
- Return exactly one hint and one question
- Hint must be 1–2 sentences max
- Question must be one short guiding question
- Use the user's current code to tailor the hint
- If code is empty, give a general conceptual hint
- If code is wrong, gently guide toward the right idea
- If code is close, give a more precise hint
- Do not include full code or full steps

Return JSON: {"hint": "...", "question": "..."}`;

const DEBRIEF_INSTRUCTIONS = `Debrief behavior:
- Explain the biggest issue in the user's solution
- Explain why it failed using a concrete example
- Identify the missed concept
- Give improvement guidance without full code
- Ask one reflection question

Return JSON: {"mainIssue": "...", "whyItFailed": "...", "missedConcept": "...", "howToImprove": "...", "reflectionQuestion": "..."}`;

const QUESTION_INSTRUCTIONS = `Question behavior:
- Answer clearly and concisely
- Use the current code when possible
- If the question is vague, ask a clarifying question
- If the question is unrelated, respond with: "Let's focus on the current problem. What part are you stuck on?"
- If the user asks for the full solution, offer a hint first

Return JSON: {"answer": "...", "followUpQuestion": "..."}`;

function buildUserMessage(body) {
  const { type, problem, code, language, results, question } = body;

  let msg = `Problem: ${problem}\nLanguage: ${language}\nCode:\n${code || '(empty)'}`;

  if (results) {
    msg += `\n\nResults: ${results.passed}/${results.total} passed`;
    if (results.failed_cases?.length) {
      msg += `\nFailed cases: ${results.failed_cases.join(', ')}`;
    }
    if (results.missed_edge_cases?.length) {
      msg += `\nMissed edge cases: ${results.missed_edge_cases.join(', ')}`;
    }
    if (results.elapsedTime != null) {
      msg += `\nElapsed time: ${results.elapsedTime}s`;
    }
  }

  if (type === 'question' && question) {
    msg += `\n\nUser question: ${question}`;
  }

  return msg;
}

function getInstructions(type) {
  switch (type) {
    case 'hint': return HINT_INSTRUCTIONS;
    case 'debrief': return DEBRIEF_INSTRUCTIONS;
    case 'question': return QUESTION_INSTRUCTIONS;
    default: throw new Error(`Unknown request type: ${type}`);
  }
}

/**
 * Handle an AI request. Returns parsed JSON from OpenAI.
 * Throws on failure — caller handles fallback.
 */
export async function handleAIRequest(body) {
  const { type } = body;
  if (!type || !['hint', 'debrief', 'question'].includes(type)) {
    throw new Error('Invalid request type');
  }

  const instructions = getInstructions(type);
  const userMessage = buildUserMessage(body);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 500,
    messages: [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\n${instructions}` },
      { role: 'user', content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from OpenAI');

  // Parse JSON — strip markdown fences if present
  const cleaned = content.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(cleaned);
}
