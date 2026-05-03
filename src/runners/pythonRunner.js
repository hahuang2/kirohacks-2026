/**
 * Python runner module — executes user-submitted Python code against test cases
 * using Pyodide in a dedicated Web Worker.
 *
 * Public API:
 *   runPython({ code, testCases, timeoutMs? }) → Promise<TestResult[]>
 *   isPyodideReady() → boolean
 *   getPyodideLoadError() → string | null
 *   extractPythonFunctionName(code) → string | null
 */

// ---------------------------------------------------------------------------
// Pyodide readiness state
// ---------------------------------------------------------------------------
let pyodideReady = false;
let pyodideLoadError = null;

// ---------------------------------------------------------------------------
// Singleton Web Worker management
// ---------------------------------------------------------------------------
let worker = null;

/**
 * Create (or recreate) the Pyodide Web Worker and wire up the init listener.
 */
function createWorker() {
  const w = new Worker(
    new URL('./pythonExecutionWorker.js', import.meta.url),
    { type: 'module' },
  );

  w.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'init') {
      if (event.data.success) {
        pyodideReady = true;
        pyodideLoadError = null;
      } else {
        pyodideReady = false;
        pyodideLoadError = event.data.error || 'Unknown Pyodide initialization error';
      }
    }
  });

  return w;
}

/**
 * Return the existing worker or lazily create one.
 * This avoids crashing in environments where Worker is not defined (e.g. jsdom tests).
 */
function getWorker() {
  if (!worker) {
    worker = createWorker();
  }
  return worker;
}

// Eagerly initialise the worker in browser environments so Pyodide starts loading.
if (typeof Worker !== 'undefined') {
  worker = createWorker();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Monotonically increasing message id for correlating worker responses. */
let nextId = 1;

/**
 * Deep equality comparison using JSON.stringify.
 * Handles arrays, objects, and primitives.
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Extract the first Python function name from code that matches `def <name>(`.
 *
 * @param {string} code — user-submitted Python source
 * @returns {string | null} — the function name, or null if none found
 */
export function extractPythonFunctionName(code) {
  const match = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns `true` once Pyodide has finished loading inside the Web Worker.
 * @returns {boolean}
 */
export function isPyodideReady() {
  return pyodideReady;
}

/**
 * Returns the Pyodide load error message, or `null` if loading succeeded (or
 * hasn't completed yet without error).
 * @returns {string | null}
 */
export function getPyodideLoadError() {
  return pyodideLoadError;
}

/**
 * Execute user-submitted Python code against an array of test cases.
 *
 * Each test case is sent individually to the Pyodide Web Worker. A per-test-case
 * timeout is enforced via `Promise.race`. On timeout the worker is terminated and
 * a fresh one is created for subsequent calls.
 *
 * @param {{ code: string, testCases: Array<{ id: string, input: any[], expected: any }>, timeoutMs?: number }} params
 * @returns {Promise<Array<{ testCaseId: string, passed: boolean, expected: any, actual: any, error?: string, timedOut?: boolean }>>}
 */
export async function runPython({ code, testCases, timeoutMs = 10000 }) {
  // ---- Guard: Pyodide not ready ----
  if (!pyodideReady) {
    const reason = pyodideLoadError || 'Pyodide is still loading';
    return testCases.map((tc) => ({
      testCaseId: tc.id,
      passed: false,
      expected: tc.expected,
      actual: undefined,
      error: `Python runtime is not available: ${reason}`,
    }));
  }

  // ---- Guard: no function definition found ----
  const fnName = extractPythonFunctionName(code);
  if (!fnName) {
    return testCases.map((tc) => ({
      testCaseId: tc.id,
      passed: false,
      expected: tc.expected,
      actual: undefined,
      error: 'Could not find a named function in the provided code.',
    }));
  }

  // ---- Run each test case ----
  const results = [];

  for (const testCase of testCases) {
    const id = nextId++;

    try {
      const outcome = await Promise.race([
        // Execution promise
        new Promise((resolve) => {
          const w = getWorker();
          const handler = (event) => {
            if (event.data && event.data.id === id) {
              w.removeEventListener('message', handler);
              resolve(event.data);
            }
          };
          w.addEventListener('message', handler);
          w.postMessage({ code, fnName, input: testCase.input, id });
        }),
        // Timeout promise
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ timedOut: true, error: `Execution timed out after ${timeoutMs}ms` });
          }, timeoutMs);
        }),
      ]);

      if (outcome.timedOut) {
        // Terminate the stuck worker and spin up a fresh one
        getWorker().terminate();
        worker = createWorker();

        results.push({
          testCaseId: testCase.id,
          passed: false,
          expected: testCase.expected,
          actual: undefined,
          timedOut: true,
          error: outcome.error,
        });
      } else if (outcome.error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          expected: testCase.expected,
          actual: outcome.actual,
          error: outcome.error,
        });
      } else {
        const passed = deepEqual(outcome.actual, testCase.expected);
        results.push({
          testCaseId: testCase.id,
          passed,
          expected: testCase.expected,
          actual: outcome.actual,
        });
      }
    } catch (unexpectedError) {
      results.push({
        testCaseId: testCase.id,
        passed: false,
        expected: testCase.expected,
        actual: undefined,
        error: unexpectedError.message || String(unexpectedError),
      });
    }
  }

  return results;
}
