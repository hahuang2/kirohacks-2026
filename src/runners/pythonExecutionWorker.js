/**
 * Module-type Web Worker for executing Python code via Pyodide.
 * Runs in a dedicated Web Worker to avoid blocking the main UI thread.
 *
 * Initialization:
 *   Posts { type: "init", success: true } on successful Pyodide load
 *   Posts { type: "init", success: false, error } on failure
 *
 * Receives: { code, fnName, input, id }
 * Posts back: { actual, error, id }
 */

import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs';

let pyodide = null;

async function initPyodide() {
  try {
    pyodide = await loadPyodide();
    self.postMessage({ type: 'init', success: true });
  } catch (err) {
    self.postMessage({ type: 'init', success: false, error: err.message || String(err) });
  }
}

initPyodide();

self.onmessage = async ({ data: { code, fnName, input, id } }) => {
  try {
    // Execute the user's Python code to define functions/variables
    await pyodide.runPythonAsync(code);

    // Get a reference to the user-defined function
    const userFn = pyodide.globals.get(fnName);

    // Convert JS input args to Python and call the function
    const pyResult = userFn(...input);

    // Convert the result back to JS
    let actual;
    if (pyResult && typeof pyResult.toJs === 'function') {
      actual = pyResult.toJs({ dict_converter: Object.fromEntries });
      pyResult.destroy();
    } else {
      // Primitive values (int, float, bool, str, None) don't need conversion
      actual = pyResult;
    }

    self.postMessage({ actual, error: null, id });
  } catch (err) {
    self.postMessage({ actual: undefined, error: err.message || String(err), id });
  }
};
