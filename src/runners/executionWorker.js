/**
 * Worker thread script for executing user code in isolation.
 * This allows the main thread to enforce timeouts on synchronous infinite loops.
 *
 * Receives: { code, fnName, input, id }
 * Posts back: { actual, error, id }
 */
import { parentPort } from 'node:worker_threads';

parentPort.on('message', ({ code, fnName, input, id }) => {
  try {
    const wrappedCode = `${code}\nreturn ${fnName};`;
    const userFn = new Function(wrappedCode)();

    if (typeof userFn !== 'function') {
      parentPort.postMessage({ actual: undefined, error: `Expected a function but got ${typeof userFn}.`, id });
      return;
    }

    const actual = userFn(...input);
    parentPort.postMessage({ actual, error: null, id });
  } catch (err) {
    parentPort.postMessage({ actual: undefined, error: err.message || String(err), id });
  }
});
