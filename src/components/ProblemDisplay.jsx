/**
 * ProblemDisplay renders the coding problem details in a scrollable panel.
 *
 * Props:
 *   problem  — Problem object (or null if not yet loaded)
 *   loadError — Error message string (or null if no error)
 */

const DIFFICULTY_STYLES = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800',
};

export default function ProblemDisplay({ problem, loadError }) {
  if (loadError && !problem) {
    return (
      <section
        className="h-full overflow-y-auto p-6"
        aria-label="Problem display"
      >
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700"
        >
          <p className="font-semibold">Failed to load problem</p>
          <p className="mt-1 text-sm">{loadError}</p>
        </div>
      </section>
    );
  }

  if (!problem) {
    return (
      <section
        className="h-full overflow-y-auto p-6"
        aria-label="Problem display"
      >
        <p className="text-gray-500">Loading problem…</p>
      </section>
    );
  }

  const badgeClass =
    DIFFICULTY_STYLES[problem.difficulty] ?? 'bg-gray-100 text-gray-800';

  return (
    <section
      className="h-full overflow-y-auto p-6 space-y-6"
      aria-label="Problem display"
    >
      {/* Title and difficulty */}
      <header>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {problem.title}
          </h2>
          <span
            className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${badgeClass}`}
          >
            {problem.difficulty}
          </span>
        </div>
      </header>

      {/* Description */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Description
        </h3>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {problem.description}
        </p>
      </div>

      {/* Examples */}
      {problem.examples && problem.examples.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Examples
          </h3>
          <ul className="space-y-4">
            {problem.examples.map((example, index) => (
              <li
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"
              >
                <p>
                  <span className="font-semibold text-gray-600">Input: </span>
                  <code className="text-gray-800">{example.input}</code>
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-gray-600">Output: </span>
                  <code className="text-gray-800">{example.output}</code>
                </p>
                {example.explanation && (
                  <p className="mt-1 text-gray-500">
                    <span className="font-semibold text-gray-600">
                      Explanation:{' '}
                    </span>
                    {example.explanation}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Constraints */}
      {problem.constraints && problem.constraints.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Constraints
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {problem.constraints.map((constraint, index) => (
              <li key={index}>
                <code>{constraint}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
