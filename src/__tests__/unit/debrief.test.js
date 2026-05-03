import { generateDebrief } from '../../services/debrief.js';
import problems from '../../data/problems.json';

const twoSum = problems.find((p) => p.id === 'two-sum');

/**
 * Helper to build test case results with a given pass/fail pattern.
 * @param {boolean[]} passedFlags - Array of booleans indicating pass/fail for each test case
 * @returns {object[]} Array of TestCaseResult objects
 */
function buildResults(passedFlags) {
  return passedFlags.map((passed, i) => ({
    testCaseId: `tc-${i}`,
    passed,
    expected: [0, 1],
    actual: passed ? [0, 1] : [1, 2],
  }));
}

describe('Debrief edge cases', () => {
  // Validates: Requirements 8.1, 8.7
  describe('all tests passing', () => {
    it('reports 100% correctness and a positive readiness score', () => {
      const results = buildResults([true, true, true, true, true]);
      const code = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
}`;

      const debrief = generateDebrief({
        problem: twoSum,
        code,
        results,
        elapsedTime: 300,
      });

      expect(debrief.correctness.passed).toBe(results.length);
      expect(debrief.correctness.total).toBe(results.length);
      expect(debrief.correctness.percentage).toBe(100);
      expect(debrief.readinessScore).toBeGreaterThan(0);
    });
  });

  // Validates: Requirements 8.1
  describe('all tests failing', () => {
    it('reports 0% correctness with passed equal to 0', () => {
      const results = buildResults([false, false, false, false, false]);
      const code = `function twoSum(nums, target) {
  return [];
}`;

      const debrief = generateDebrief({
        problem: twoSum,
        code,
        results,
        elapsedTime: 600,
      });

      expect(debrief.correctness.passed).toBe(0);
      expect(debrief.correctness.total).toBe(results.length);
      expect(debrief.correctness.percentage).toBe(0);
    });
  });

  // Validates: Requirements 8.7, 8.1
  describe('empty code string', () => {
    it('returns safe defaults', () => {
      const results = buildResults([false, false]);

      const debrief = generateDebrief({
        problem: twoSum,
        code: '',
        results,
        elapsedTime: 120,
      });

      expect(debrief.codeFeedback).toEqual([]);
      expect(debrief.readinessScore).toBe(0);
      expect(debrief.timeComplexity).toBe('O(?)');
      expect(debrief.spaceComplexity).toBe('O(?)');
    });
  });

  // Validates: Requirements 8.8
  describe('elapsed time', () => {
    it('includes the elapsed time in the output matching the input value', () => {
      const results = buildResults([true, true]);
      const code = `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;

      const elapsedTime = 542;
      const debrief = generateDebrief({
        problem: twoSum,
        code,
        results,
        elapsedTime,
      });

      expect(debrief.elapsedTime).toBe(elapsedTime);
    });
  });

  // Validates: Requirements 8.1 (alternativeApproaches from problem data)
  describe('alternative approaches', () => {
    it('includes alternativeApproaches from the problem data', () => {
      const results = buildResults([true]);
      const code = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const c = target - nums[i];
    if (map.has(c)) return [map.get(c), i];
    map.set(nums[i], i);
  }
}`;

      const debrief = generateDebrief({
        problem: twoSum,
        code,
        results,
        elapsedTime: 200,
      });

      expect(debrief.alternativeApproaches).toEqual(
        twoSum.debrief.alternativeApproaches
      );
      expect(debrief.alternativeApproaches.length).toBeGreaterThan(0);

      // Each approach should have the expected shape
      for (const approach of debrief.alternativeApproaches) {
        expect(approach).toHaveProperty('name');
        expect(approach).toHaveProperty('description');
        expect(approach).toHaveProperty('timeComplexity');
        expect(approach).toHaveProperty('spaceComplexity');
      }
    });
  });
});
