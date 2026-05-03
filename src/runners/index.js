import { runJavaScript } from './javascriptRunner.js';
import { runPython } from './pythonRunner.js';

/**
 * Dispatches code execution to the appropriate language-specific runner.
 *
 * @param {{ language: string, code: string, testCases: import('../data/problems.json')[0]['sampleTestCases'] }} params
 * @returns {Promise<Array<{ testCaseId: string, passed: boolean, expected: any, actual: any, error?: string, timedOut?: boolean }>>}
 */
export async function runCode({ language, code, testCases }) {
  if (language === 'javascript') {
    return runJavaScript({ code, testCases });
  }

  if (language === 'python') {
    return runPython({ code, testCases });
  }

  throw new Error(`Unsupported language: "${language}". Currently only "javascript" and "python" are supported.`);
}
