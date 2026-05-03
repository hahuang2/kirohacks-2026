/**
 * Frontend AI service — calls the backend /api/ai endpoint.
 * Falls back gracefully if AI is unavailable.
 */

const API_BASE = 'http://localhost:3001';

let _aiEnabled = null;

/**
 * Check if AI is available by hitting the health endpoint.
 * Caches the result after first call.
 */
export async function isAIEnabled() {
  if (_aiEnabled !== null) return _aiEnabled;
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) { _aiEnabled = false; return false; }
    const data = await res.json();
    _aiEnabled = data.aiEnabled === true;
    return _aiEnabled;
  } catch {
    _aiEnabled = false;
    return false;
  }
}

/**
 * Reset the cached AI status (useful when retrying).
 */
export function resetAIStatus() {
  _aiEnabled = null;
}

/**
 * Request an AI hint.
 * @returns {{ hint: string, question: string } | null} — null on failure
 */
export async function getAIHint({ problem, code, language }) {
  try {
    const res = await fetch(`${API_BASE}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        type: 'hint',
        problem: problem.title,
        code,
        language,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Request an AI debrief.
 * @returns {{ mainIssue, whyItFailed, missedConcept, howToImprove, reflectionQuestion } | null}
 */
export async function getAIDebrief({ problem, code, language, results, elapsedTime }) {
  try {
    const failedCases = results
      .filter((r) => !r.passed)
      .map((r) => JSON.stringify(r.expected))
      .slice(0, 3);

    const res = await fetch(`${API_BASE}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        type: 'debrief',
        problem: problem.title,
        code,
        language,
        results: {
          passed: results.filter((r) => r.passed).length,
          total: results.length,
          failed_cases: failedCases,
          missed_edge_cases: [],
          elapsedTime,
        },
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Ask AI a question about the current code/problem.
 * @returns {{ answer: string, followUpQuestion: string } | null}
 */
export async function askAIQuestion({ problem, code, language, question }) {
  try {
    const res = await fetch(`${API_BASE}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        type: 'question',
        problem: problem.title,
        code,
        language,
        question,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
