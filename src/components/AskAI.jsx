/**
 * AskAI — a small input for asking AI questions about the current code/problem.
 *
 * Props:
 *   onAsk     — (question: string) => Promise<void>
 *   aiEnabled — boolean
 *   answer    — { answer: string, followUpQuestion: string } | null
 *   isLoading — boolean
 */

import { useState } from 'react';

export default function AskAI({ onAsk, aiEnabled, answer, isLoading }) {
  const [question, setQuestion] = useState('');

  if (!aiEnabled) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || isLoading) return;
    onAsk(q);
    setQuestion('');
  }

  return (
    <section className="border-t border-gray-200 bg-white px-3 py-2" aria-label="Ask AI">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your code..."
          disabled={isLoading}
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          aria-label="Ask AI a question"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? '...' : 'Ask AI'}
        </button>
      </form>

      {answer && (
        <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm">
          <p className="text-gray-800">{answer.answer}</p>
          {answer.followUpQuestion && (
            <p className="mt-1 italic text-purple-700">💡 {answer.followUpQuestion}</p>
          )}
        </div>
      )}
    </section>
  );
}
