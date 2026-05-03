/**
 * ProblemSelector displays three difficulty-level cards (Easy, Medium, Hard).
 * When the user clicks a card, a random problem at that difficulty is selected
 * and passed to the onSelectProblem callback.
 *
 * Props:
 *   problems        — Array of problem objects (each must have a `difficulty` field)
 *   onSelectProblem  — Callback (problem) => void
 */

const DIFFICULTY_LEVELS = [
  { level: 'Easy', border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700', hoverBg: 'hover:bg-green-100' },
  { level: 'Medium', border: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700', hoverBg: 'hover:bg-yellow-100' },
  { level: 'Hard', border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-700', hoverBg: 'hover:bg-red-100' },
];

/**
 * Filters problems to the given difficulty and returns one at random.
 * Returns null if no problems match.
 *
 * Exported for independent testing.
 */
export function selectProblemByDifficulty(problems, difficulty) {
  const matching = (problems || []).filter((p) => p.difficulty === difficulty);
  if (matching.length === 0) return null;
  const index = Math.floor(Math.random() * matching.length);
  return matching[index];
}

export default function ProblemSelector({ problems, onSelectProblem }) {
  const grouped = {};
  for (const p of problems || []) {
    if (!grouped[p.difficulty]) {
      grouped[p.difficulty] = [];
    }
    grouped[p.difficulty].push(p);
  }

  const handleClick = (level) => {
    const selected = selectProblemByDifficulty(problems, level);
    if (selected) {
      onSelectProblem(selected);
    }
  };

  return (
    <section className="flex h-full items-center justify-center" aria-label="Problem selection">
      <div className="text-center">
        <h2 className="mb-8 text-2xl font-bold text-gray-800">Choose a Difficulty</h2>
        <div className="flex gap-6">
          {DIFFICULTY_LEVELS.map(({ level, border, bg, text, hoverBg }) => {
            const count = (grouped[level] || []).length;
            const disabled = count === 0;

            return (
              <button
                key={level}
                data-testid={`difficulty-${level}`}
                onClick={() => handleClick(level)}
                disabled={disabled}
                className={`flex w-48 flex-col items-center rounded-xl border-2 p-6 transition-colors ${
                  disabled
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                    : `${border} ${bg} ${text} ${hoverBg} cursor-pointer`
                }`}
              >
                <span className="text-xl font-semibold">{level}</span>
                <span className={`mt-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                  {count} {count === 1 ? 'problem' : 'problems'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
