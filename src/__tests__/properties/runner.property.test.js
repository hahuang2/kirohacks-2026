// Feature: algo-mentor, Property 1: Runner produces correct pass/fail results
import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';

// Mock the Python runner to avoid Web Worker creation in test environment
vi.mock('../../runners/pythonRunner.js', () => ({
  runPython: vi.fn(),
}));

import { runJavaScript } from '../../runners/javascriptRunner.js';
import { runCode } from '../../runners/index.js';

// **Validates: Requirements 3.1, 4.1**

describe('Property 1: Runner produces correct pass/fail results', () => {
  it('passed is true iff the function return value deeply equals the expected output', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        async (a, b) => {
          const correctSum = a + b;
          const incorrectSum = a + b + 1;

          const code = 'function add(a, b) { return a + b; }';

          const testCases = [
            { id: 'tc-pass', input: [a, b], expected: correctSum },
            { id: 'tc-fail', input: [a, b], expected: incorrectSum },
          ];

          const results = await runJavaScript({ code, testCases });

          // Should have one result per test case
          expect(results).toHaveLength(2);

          const passResult = results.find((r) => r.testCaseId === 'tc-pass');
          const failResult = results.find((r) => r.testCaseId === 'tc-fail');

          // The test case with expected = a + b should pass
          expect(passResult.passed).toBe(true);
          expect(passResult.actual).toBe(correctSum);
          expect(passResult.expected).toBe(correctSum);

          // The test case with expected = a + b + 1 should fail
          expect(failResult.passed).toBe(false);
          expect(failResult.actual).toBe(correctSum);
          expect(failResult.expected).toBe(incorrectSum);
        }
      ),
      { numRuns: 100 }
    );
  }, 15000);
});

// Feature: algo-mentor, Property 2: Runner results contain required fields

// **Validates: Requirements 3.2, 4.2, 5.4**

describe('Property 2: Runner results contain required fields', () => {
  it('every result contains testCaseId, passed (boolean), expected, and actual fields', async () => {
    // Increased timeout to account for worker thread overhead per iteration
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            input: fc.array(fc.anything()),
            expected: fc.anything(),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (testCases) => {
          // Use a valid simple function so the runner always produces results
          const code = 'function f(x) { return x; }';

          const results = await runJavaScript({ code, testCases });

          // Should have one result per test case
          expect(results).toHaveLength(testCases.length);

          for (const result of results) {
            // testCaseId must be a string
            expect(result).toHaveProperty('testCaseId');
            expect(typeof result.testCaseId).toBe('string');

            // passed must be a boolean
            expect(result).toHaveProperty('passed');
            expect(typeof result.passed).toBe('boolean');

            // expected must be present (can be any value including undefined)
            expect(Object.prototype.hasOwnProperty.call(result, 'expected')).toBe(true);

            // actual must be present (can be any value including undefined)
            expect(Object.prototype.hasOwnProperty.call(result, 'actual')).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 15000);
});

// Feature: algo-mentor, Property 3: Runner captures runtime errors

// **Validates: Requirements 3.3, 4.4**

describe('Property 3: Runner captures runtime errors', () => {
  it('code that throws an error produces passed: false and a non-empty error string', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (errorMsg) => {
          // Escape the error message for safe embedding in a string literal
          const escaped = errorMsg
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');

          const code = `function f() { throw new Error("${escaped}"); }`;

          const testCases = [
            { id: 'tc-error', input: [], expected: null },
          ];

          const results = await runJavaScript({ code, testCases });

          expect(results).toHaveLength(1);

          const result = results[0];
          expect(result.passed).toBe(false);
          expect(typeof result.error).toBe('string');
          expect(result.error.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  }, 15000);
});

// Feature: algo-mentor, Property 4: Runner dispatch correctness

// **Validates: Requirements 5.2, 5.3**

describe('Property 4: Runner dispatch correctness', () => {
  it('runCode with "javascript" produces the same results as runJavaScript directly', async () => {
    // Increased timeout to account for worker thread overhead per iteration
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        async (a, b) => {
          const code = 'function add(a, b) { return a + b; }';
          const testCases = [
            { id: 'tc-dispatch', input: [a, b], expected: a + b },
          ];

          const dispatchResult = await runCode({ language: 'javascript', code, testCases });
          const directResult = await runJavaScript({ code, testCases });

          expect(dispatchResult).toEqual(directResult);
        }
      ),
      { numRuns: 100 }
    );
  }, 15000);

  it('runCode with any non-"javascript" language string returns an error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((s) => s !== 'javascript' && s !== 'python'),
        async (language) => {
          const code = 'function f() { return 1; }';
          const testCases = [{ id: 'tc-unsupported', input: [], expected: 1 }];

          await expect(runCode({ language, code, testCases })).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: python-language-support, Property 2: Runner dispatcher routes to correct runner

// **Validates: Requirements 2.5, 5.1, 5.2**

import { runPython } from '../../runners/pythonRunner.js';

describe('Feature: python-language-support, Property 2: Runner dispatcher routes to correct runner', () => {
  it('runCode delegates to the correct runner for any supported language', async () => {
    // Configure the mocked runPython to return a plausible result
    runPython.mockImplementation(async ({ testCases }) =>
      testCases.map((tc) => ({
        testCaseId: tc.id,
        passed: true,
        expected: tc.expected,
        actual: tc.expected,
      })),
    );

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('python', 'javascript'),
        fc.integer({ min: -100, max: 100 }),
        fc.integer({ min: -100, max: 100 }),
        async (language, a, b) => {
          // Reset call tracking before each iteration
          runPython.mockClear();

          const code =
            language === 'javascript'
              ? 'function add(a, b) { return a + b; }'
              : 'def add(a, b):\n    return a + b';

          const testCases = [{ id: 'tc-route', input: [a, b], expected: a + b }];

          const results = await runCode({ language, code, testCases });

          // Should always produce results
          expect(results).toHaveLength(1);

          if (language === 'python') {
            // The mocked runPython should have been called exactly once
            expect(runPython).toHaveBeenCalledTimes(1);
            expect(runPython).toHaveBeenCalledWith({ code, testCases });
          } else {
            // runPython should NOT have been called for JavaScript
            expect(runPython).not.toHaveBeenCalled();
            // The real JavaScript runner should have produced a correct result
            expect(results[0].passed).toBe(true);
            expect(results[0].actual).toBe(a + b);
          }
        },
      ),
      { numRuns: 100 },
    );
  }, 15000);
});

// Feature: python-language-support, Property 3: Unsupported language throws error

// **Validates: Requirements 5.3**

describe('Feature: python-language-support, Property 3: Unsupported language throws error', () => {
  it('runCode rejects with an error for any language not in {"python", "javascript"}', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((s) => s !== 'javascript' && s !== 'python'),
        async (language) => {
          const code = 'function f() { return 1; }';
          const testCases = [{ id: 'tc-unsupported', input: [], expected: 1 }];

          await expect(runCode({ language, code, testCases })).rejects.toThrow();
        },
      ),
      { numRuns: 100 },
    );
  });
});
