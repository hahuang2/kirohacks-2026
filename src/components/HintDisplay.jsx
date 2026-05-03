/**
 * HintDisplay shows accumulated hints from the Interview Copilot.
 *
 * Props:
 *   hints — Array of hint strings
 */

export default function HintDisplay({ hints }) {
  if (!hints || hints.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 p-4" aria-label="Hint display">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Hints
      </h3>

      <ol className="space-y-2">
        {hints.map((hint, index) => (
          <li
            key={index}
            className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-gray-700"
          >
            <span className="font-semibold text-blue-700">
              Hint {index + 1}:{' '}
            </span>
            {hint}
          </li>
        ))}
      </ol>
    </section>
  );
}
