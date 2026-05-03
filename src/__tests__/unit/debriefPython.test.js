import { generateDebrief } from '../../services/debrief.js';
import problems from '../../data/problems.json';

const twoSumProblem = problems.find((p) => p.id === 'two-sum');

// Simple results fixture: one passing test case
const passingResults = [
  { testCaseId: 't1', passed: true, expected: [0, 1], actual: [0, 1] },
];

describe('Debrief Python patterns', () => {
  // --- Time Complexity ---
  // Validates: Requirements 8.1

  describe('time complexity', () => {
    it('detects nested for loops as O(n^2)', () => {
      const code = `def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.timeComplexity).toBe('O(n^2)');
    });

    it('detects a single for loop as O(n)', () => {
      const code = `def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        complement = target - nums[i]
        if complement in seen:
            return [seen[complement], i]
        seen[nums[i]] = i`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.timeComplexity).toBe('O(n)');
    });

    it('detects a while loop as O(n)', () => {
      const code = `def two_sum(nums, target):
    i = 0
    while i < len(nums):
        i += 1
    return []`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.timeComplexity).toBe('O(n)');
    });

    it('detects a list comprehension as O(n)', () => {
      const code = `def two_sum(nums, target):
    pairs = [i for i in range(len(nums))]
    return pairs`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.timeComplexity).toBe('O(n)');
    });

    it('detects no loops as O(1)', () => {
      const code = `def two_sum(nums, target):
    return [0, 1]`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.timeComplexity).toBe('O(1)');
    });
  });

  // --- Space Complexity ---
  // Validates: Requirements 8.2

  describe('space complexity', () => {
    it('detects dict() usage as O(n)', () => {
      const code = `def two_sum(nums, target):
    seen = dict()
    for i in range(len(nums)):
        seen[nums[i]] = i
    return []`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.spaceComplexity).toBe('O(n)');
    });

    it('detects set() usage as O(n)', () => {
      const code = `def two_sum(nums, target):
    seen = set()
    for num in nums:
        seen.add(num)
    return []`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.spaceComplexity).toBe('O(n)');
    });

    it('detects {} as dict as O(n)', () => {
      const code = `def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        seen[nums[i]] = i
    return []`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.spaceComplexity).toBe('O(n)');
    });

    it('detects [] with .append() as O(n)', () => {
      const code = `def two_sum(nums, target):
    result = []
    for num in nums:
        result.append(num)
    return result`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.spaceComplexity).toBe('O(n)');
    });

    it('detects no data structures as O(1)', () => {
      const code = `def two_sum(nums, target):
    return [0, 1]`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.spaceComplexity).toBe('O(1)');
    });
  });

  // --- Code Feedback ---
  // Validates: Requirements 8.3

  describe('code feedback', () => {
    it('detects dictionary usage and provides feedback', () => {
      const code = `def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        complement = target - nums[i]
        if complement in seen:
            return [seen[complement], i]
        seen[nums[i]] = i`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.codeFeedback).toContain(
        'Good use of dictionary for O(n) lookup'
      );
    });

    it('suggests adding comments when no # comments are present', () => {
      const code = `def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        complement = target - nums[i]
        if complement in seen:
            return [seen[complement], i]
        seen[nums[i]] = i`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'python',
      });

      expect(debrief.codeFeedback).toContain(
        'Consider adding comments to explain your approach'
      );
    });
  });

  // --- Backward Compatibility ---
  // Validates: Requirements 8.4

  describe('JavaScript backward compatibility', () => {
    it('produces the same analysis for JavaScript code as before', () => {
      const code = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
}`;

      const debrief = generateDebrief({
        problem: twoSumProblem,
        code,
        results: passingResults,
        elapsedTime: 300,
        language: 'javascript',
      });

      expect(debrief.timeComplexity).toBe('O(n)');
      expect(debrief.spaceComplexity).toBe('O(n)');
      expect(debrief.codeFeedback).toContain(
        'Good use of hash map for O(n) lookup'
      );
      expect(debrief.correctness.passed).toBe(1);
      expect(debrief.correctness.total).toBe(1);
      expect(debrief.correctness.percentage).toBe(100);
    });
  });
});
