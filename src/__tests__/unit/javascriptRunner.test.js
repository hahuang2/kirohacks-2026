import { describe, it, expect } from 'vitest';
import { runJavaScript } from '../../runners/javascriptRunner.js';

describe('runJavaScript', () => {
  // --- Timeout handling tests (Requirements 3.4, 4.5) ---

  it('returns a timeout error for an infinite loop within a reasonable time', async () => {
    const code = 'function f() { while(true) {} }';
    const testCases = [
      { id: 'tc-timeout', input: [], expected: undefined },
    ];

    const results = await runJavaScript({ code, testCases, timeoutMs: 200 });

    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);
    expect(results[0].timedOut).toBe(true);
    expect(results[0].error).toContain('timed out');
  }, 10000);

  it('completes a slow but valid function before the timeout', async () => {
    const code = 'function f(n) { let sum = 0; for (let i = 0; i < n; i++) sum += i; return sum; }';
    const testCases = [
      { id: 'tc-slow', input: [1000], expected: 499500 },
    ];

    const results = await runJavaScript({ code, testCases, timeoutMs: 5000 });

    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(true);
    expect(results[0].timedOut).toBeFalsy();
  });

  // --- Existing tests ---

  it('returns correct pass result for a valid function', async () => {
    const code = 'function add(a, b) { return a + b; }';
    const testCases = [
      { id: 'tc-1', input: [2, 3], expected: 5 },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results).toHaveLength(1);
    expect(results[0].testCaseId).toBe('tc-1');
    expect(results[0].passed).toBe(true);
    expect(results[0].expected).toBe(5);
    expect(results[0].actual).toBe(5);
  });

  it('returns fail result when actual does not match expected', async () => {
    const code = 'function add(a, b) { return a - b; }';
    const testCases = [
      { id: 'tc-1', input: [2, 3], expected: 5 },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);
    expect(results[0].actual).toBe(-1);
    expect(results[0].expected).toBe(5);
  });

  it('uses deep equality for arrays', async () => {
    const code = 'function twoSum(nums, target) { return [0, 1]; }';
    const testCases = [
      { id: 'tc-1', input: [[2, 7, 11, 15], 9], expected: [0, 1] },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results[0].passed).toBe(true);
    expect(results[0].actual).toEqual([0, 1]);
  });

  it('uses deep equality for objects', async () => {
    const code = 'function getObj() { return { a: 1, b: 2 }; }';
    const testCases = [
      { id: 'tc-1', input: [], expected: { a: 1, b: 2 } },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results[0].passed).toBe(true);
  });

  it('catches runtime errors and returns them in the result', async () => {
    const code = 'function broken() { throw new Error("oops"); }';
    const testCases = [
      { id: 'tc-1', input: [], expected: 42 },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);
    expect(results[0].error).toBe('oops');
    expect(results[0].actual).toBeUndefined();
  });

  it('catches syntax errors in user code', async () => {
    const code = 'function broken( { return 1; }';
    const testCases = [
      { id: 'tc-1', input: [], expected: 1 },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);
    expect(results[0].error).toBeTruthy();
  });

  it('returns error when no named function is found', async () => {
    const code = 'const x = 42;';
    const testCases = [
      { id: 'tc-1', input: [], expected: 42 },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);
    expect(results[0].error).toContain('Could not find a named function');
  });

  it('handles multiple test cases', async () => {
    const code = 'function double(n) { return n * 2; }';
    const testCases = [
      { id: 'tc-1', input: [3], expected: 6 },
      { id: 'tc-2', input: [0], expected: 0 },
      { id: 'tc-3', input: [-5], expected: -10 },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results).toHaveLength(3);
    expect(results.every(r => r.passed)).toBe(true);
  });

  it('returns all required fields in each result', async () => {
    const code = 'function identity(x) { return x; }';
    const testCases = [
      { id: 'tc-1', input: [42], expected: 42 },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results[0]).toHaveProperty('testCaseId');
    expect(results[0]).toHaveProperty('passed');
    expect(results[0]).toHaveProperty('expected');
    expect(results[0]).toHaveProperty('actual');
    expect(typeof results[0].passed).toBe('boolean');
  });

  it('works with the Two Sum problem', async () => {
    const code = `function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
          return [map.get(complement), i];
        }
        map.set(nums[i], i);
      }
    }`;
    const testCases = [
      { id: 'sample-1', input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { id: 'sample-2', input: [[3, 2, 4], 6], expected: [1, 2] },
      { id: 'sample-3', input: [[3, 3], 6], expected: [0, 1] },
    ];

    const results = await runJavaScript({ code, testCases });

    expect(results).toHaveLength(3);
    expect(results.every(r => r.passed)).toBe(true);
  });
});
