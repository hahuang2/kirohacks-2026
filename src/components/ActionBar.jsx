/**
 * ActionBar renders the Run, Submit, and Get Hint action buttons.
 *
 * Props:
 *   onRun      — Callback invoked when the user clicks "Run"
 *   onSubmit   — Callback invoked when the user clicks "Submit"
 *   onGetHint  — Callback invoked when the user clicks "Get Hint"
 *   isRunning  — Boolean; when true, all buttons are disabled to prevent double-clicks
 */

export default function ActionBar({ onRun, onSubmit, onGetHint, isRunning }) {
  return (
    <div className="flex items-center gap-3 p-3" role="toolbar" aria-label="Action bar">
      <button
        type="button"
        onClick={onRun}
        disabled={isRunning}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Run
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isRunning}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit
      </button>

      <button
        type="button"
        onClick={onGetHint}
        disabled={isRunning}
        className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Get Hint
      </button>
    </div>
  );
}
