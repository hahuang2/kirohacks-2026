/**
 * DebriefPanel displays the full debrief after submission.
 *
 * Props:
 *   debrief — DebriefData object containing correctness, complexity,
 *             feedback, edge cases, alternative approaches, readiness score,
 *             and elapsed time
 *   onBack  — Callback invoked when the user clicks the "Back" button
 */

import { formatTime } from '../utils/timer';
import ApproachCard from './ApproachCard';

export default function DebriefPanel({ debrief, onBack }) {
  const {
    correctness,
    timeComplexity,
    spaceComplexity,
    codeFeedback,
    missedEdgeCases,
    alternativeApproaches,
    readinessScore,
    elapsedTime,
  } = debrief;

  return (
    <section className="space-y-6 p-6" aria-label="Debrief panel">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Debrief</h2>
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {/* Readiness Score */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
          Interview Readiness Score
        </p>
        <p className="mt-1 text-4xl font-bold text-indigo-700" data-testid="readiness-score">
          {readinessScore}
          <span className="text-lg font-normal text-indigo-400"> / 100</span>
        </p>
      </div>

      {/* Correctness Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Correctness
        </h3>
        <p className="mt-1 text-lg text-gray-800">
          <span className="font-bold">{correctness.passed}</span> / {correctness.total} test cases passed
          <span className="ml-2 text-sm text-gray-500">
            ({Math.round(correctness.percentage)}%)
          </span>
        </p>
      </div>

      {/* Complexity Analysis */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Complexity Analysis
        </h3>
        <div className="mt-2 flex gap-6">
          <div>
            <p className="text-xs text-gray-500">Time Complexity</p>
            <p className="text-lg font-semibold text-gray-800">{timeComplexity}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Space Complexity</p>
            <p className="text-lg font-semibold text-gray-800">{spaceComplexity}</p>
          </div>
        </div>
      </div>

      {/* Code Feedback */}
      {codeFeedback.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Code Feedback
          </h3>
          <ul className="mt-2 space-y-1">
            {codeFeedback.map((item, index) => (
              <li key={index} className="text-sm text-gray-700">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missed Edge Cases */}
      {missedEdgeCases.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-600">
            Missed Edge Cases
          </h3>
          <ul className="mt-2 space-y-1">
            {missedEdgeCases.map((edgeCase, index) => (
              <li key={index} className="text-sm text-yellow-800">
                • {edgeCase}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternative Approaches */}
      {alternativeApproaches.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Alternative Approaches
          </h3>
          <div className="mt-2 space-y-3">
            {alternativeApproaches.map((approach, index) => (
              <ApproachCard key={index} approach={approach} />
            ))}
          </div>
        </div>
      )}

      {/* Elapsed Time */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Elapsed Time
        </h3>
        <p className="mt-1 text-lg font-semibold text-gray-800">
          {formatTime(elapsedTime)}
        </p>
      </div>
    </section>
  );
}
