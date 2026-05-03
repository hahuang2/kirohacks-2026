/**
 * TestResults displays a list of test case results with pass/fail status.
 *
 * Props:
 *   results — Array of TestCaseResult objects
 *
 * Each TestCaseResult has:
 *   testCaseId — Unique identifier for the test case
 *   passed     — Boolean indicating pass or fail
 *   expected   — The expected output value
 *   actual     — The actual output value
 *   error      — Optional runtime error message
 *   timedOut   — Optional boolean indicating a timeout
 */

export default function TestResults({ results }) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 p-4" aria-label="Test results">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Test Results
      </h3>

      <ul className="space-y-2">
        {results.map((result) => (
          <li
            key={result.testCaseId}
            className={`rounded-lg border p-3 text-sm ${
              result.passed
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-5 w-5 rounded-full text-center text-xs font-bold leading-5 ${
                  result.passed
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
                aria-hidden="true"
              >
                {result.passed ? '✓' : '✗'}
              </span>
              <span className="font-medium text-gray-800">
                {result.testCaseId}
              </span>
              <span
                className={`ml-auto text-xs font-semibold ${
                  result.passed ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.passed ? 'Passed' : 'Failed'}
              </span>
            </div>

            <div className="mt-2 space-y-1 text-gray-700">
              <p>
                <span className="font-semibold text-gray-600">Expected: </span>
                <code>{JSON.stringify(result.expected)}</code>
              </p>
              <p>
                <span className="font-semibold text-gray-600">Actual: </span>
                <code>{JSON.stringify(result.actual)}</code>
              </p>
            </div>

            {result.error && (
              <p className="mt-2 rounded bg-red-100 px-2 py-1 text-xs text-red-700" role="alert">
                <span className="font-semibold">Error: </span>
                {result.error}
              </p>
            )}

            {result.timedOut && (
              <p className="mt-2 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800" role="alert">
                <span className="font-semibold">Timed out: </span>
                Execution exceeded the time limit.
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
