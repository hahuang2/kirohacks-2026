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
 * Detect whether we are running in a Node.js-like environment with worker_threads.
 */
function hasWorkerThreads() {
  try {
    return typeof process !== 'undefined' && process.versions && process.versions.node;
  } catch {
    return false;
  }
}

/**
 * Execute a single test case in a dedicated worker thread with a hard timeout.
 * Spawns a fresh worker per call so that infinite loops can be terminated.
 *
 * @param {{ code: string, fnName: string, input: any[], timeoutMs: number }} params
 * @returns {Promise<{ actual: any, error: string|null, timedOut?: boolean }>}
 */
async function executeInWorker({ code, fnName, input, timeoutMs }) {
  const { Worker } = await import('node:worker_threads');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const workerPath = join(__dirname, 'executionWorker.js');

  return new Promise((resolve) => {
    const worker = new Worker(workerPath);
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        worker.terminate();
        resolve({ actual: undefined, error: `Execution timed out after ${timeoutMs}ms`, timedOut: true });
      }
    }, timeoutMs);

    worker.on('message', (msg) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        resolve(msg);
      }
    });

    worker.on('error', (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        resolve({ actual: undefined, error: err.message || String(err) });
      }
    });

    worker.on('exit', (exitCode) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ actual: undefined, error: `Worker exited with code ${exitCode}` });
      }
    });

    worker.postMessage({ code, fnName, input });
  });
}

/**
 * Execute user code in the main thread using Promise.race (browser fallback).
 * Note: This cannot enforce timeouts on synchronous infinite loops.
 *
 * @param {{ userFn: Function, input: any[], timeoutMs: number }} params
 * @returns {Promise<{ actual: any, error: string|null, timedOut?: boolean }>}
 */
function executeInMainThread({ userFn, input, timeoutMs }) {
  const executionPromise = new Promise((resolve) => {
    try {
      const actual = userFn(...input);
      resolve({ actual, error: null });
    } catch (runtimeError) {
      resolve({ actual: undefined, error: runtimeError.message || String(runtimeError) });
    }
  });

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({ actual: undefined, error: `Execution timed out after ${timeoutMs}ms`, timedOut: true });
    }, timeoutMs);
  });

  return Promise.race([executionPromise, timeoutPromise]);
}

/**
 * Executes user-submitted JavaScript code against an array of test cases.
 *
 * Uses worker_threads in Node.js environments for proper timeout enforcement
 * (handles synchronous infinite loops). Falls back to main-thread Promise.race
 * in browser environments.
 *
 * @param {{ code: string, testCases: import('../data/problems.json')[0]['sampleTestCases'], timeoutMs?: number }} params
 * @returns {Promise<Array<{ testCaseId: string, passed: boolean, expected: any, actual: any, error?: string, timedOut?: boolean }>>}
 */
export async function runJavaScript({ code, testCases, timeoutMs = 5000 }) {
  const results = [];
  const useWorker = hasWorkerThreads();

  for (const testCase of testCases) {
    try {
      const fnNameMatch = code.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
      if (!fnNameMatch) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          expected: testCase.expected,
          actual: undefined,
          error: 'Could not find a named function in the provided code.',
        });
        continue;
      }

      const fnName = fnNameMatch[1];

      let outcome;

      if (useWorker) {
        // Use worker thread for proper timeout enforcement (handles infinite loops)
        outcome = await executeInWorker({ code, fnName, input: testCase.input, timeoutMs });
      } else {
        // Fallback: main thread execution with Promise.race
        const wrappedCode = `${code}\nreturn ${fnName};`;

        let userFn;
        try {
          userFn = new Function(wrappedCode)();
        } catch (evalError) {
          results.push({
            testCaseId: testCase.id,
            passed: false,
            expected: testCase.expected,
            actual: undefined,
            error: evalError.message || String(evalError),
          });
          continue;
        }

        if (typeof userFn !== 'function') {
          results.push({
            testCaseId: testCase.id,
            passed: false,
            expected: testCase.expected,
            actual: undefined,
            error: `Expected a function but got ${typeof userFn}.`,
          });
          continue;
        }

        outcome = await executeInMainThread({ userFn, input: testCase.input, timeoutMs });
      }

      if (outcome.timedOut) {
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
