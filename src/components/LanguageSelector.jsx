/**
 * LanguageSelector renders a toggle between Python and JavaScript.
 *
 * Props:
 *   language  — "python" | "javascript" — the currently active language
 *   onChange  — (language: string) => void — called when the user picks a different language
 */

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
];

export default function LanguageSelector({ language, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Select coding language"
      className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-0.5"
    >
      {LANGUAGES.map(({ value, label }) => {
        const isActive = language === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            onClick={() => {
              if (!isActive) {
                onChange(value);
              }
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
