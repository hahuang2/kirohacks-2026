// Feature: algo-mentor, Property 7: Correctness summary accuracy
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateDebrief } from '../../services/debrief.js';
import problems from '../../data/problems.json';

// **Validates: Requirements 8.1**

const twoSumProblem = problems.find((p) => p.id === 'two-sum');

describe('Property 7: Correctness summary accuracy', () => {
  it('correctness.passed equals count of passed === true, total equals array length, percentage equals (passed / total) * 100', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            testCaseId: fc.string(),
            passed: fc.boolean(),
            expected: fc.anything(),
            actual: fc.anything(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (results) => {
          const debrief = generateDebrief({
            problem: twoSumProblem,
            code: 'function twoSum() {}',
            results,
            elapsedTime: 60,
          });

          const expectedPassed = results.filter((r) => r.passed === true).length;
          const expectedTotal = results.length;
          const expectedPercentage = (expectedPassed / expectedTotal) * 100;

          expect(debrief.correctness.passed).toBe(expectedPassed);
          expect(debrief.correctness.total).toBe(expectedTotal);
          expect(debrief.correctness.percentage).toBe(expectedPercentage);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: algo-mentor, Property 8: Complexity analysis produces valid Big-O notation

// **Validates: Requirements 8.2, 8.3**

describe('Property 8: Complexity analysis produces valid Big-O notation', () => {
  const bigOPattern = /^O\(.+\)$/;

  const realisticSnippets = [
    'for (let i = 0; i < nums.length; i++) { sum += nums[i]; }',
    'for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) { count++; } }',
    'const map = new Map(); for (const x of arr) { map.set(x, true); }',
    'const seen = new Set(); nums.forEach(n => seen.add(n));',
    'let result = []; arr.forEach(x => result.push(x * 2));',
    'const obj = {}; for (let i = 0; i < arr.length; i++) { obj[arr[i]] = i; }',
    'return nums[0] + nums[1];',
    'if (nums.length === 0) return null;',
    'const arr = new Array(n); for (let i = 0; i < n; i++) { arr[i] = i; }',
    'while (left < right) { left++; right--; }',
  ];

  const codeBodyArb = fc.oneof(
    fc.constant(realisticSnippets[0]),
    fc.constant(realisticSnippets[1]),
    fc.constant(realisticSnippets[2]),
    fc.constant(realisticSnippets[3]),
    fc.constant(realisticSnippets[4]),
    fc.constant(realisticSnippets[5]),
    fc.constant(realisticSnippets[6]),
    fc.constant(realisticSnippets[7]),
    fc.constant(realisticSnippets[8]),
    fc.constant(realisticSnippets[9]),
    fc.string({ minLength: 1, maxLength: 200 })
  );

  const wrappedCodeArb = codeBodyArb.map(
    (body) => `function solve(nums, target) {\n  ${body}\n}`
  );

  it('timeComplexity and spaceComplexity each match O(...) for any non-empty code', () => {
    fc.assert(
      fc.property(wrappedCodeArb, (code) => {
        const debrief = generateDebrief({
          problem: twoSumProblem,
          code,
          results: [
            { testCaseId: 't1', passed: true, expected: [0, 1], actual: [0, 1] },
          ],
          elapsedTime: 120,
        });

        expect(debrief.timeComplexity).toMatch(bigOPattern);
        expect(debrief.spaceComplexity).toMatch(bigOPattern);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: algo-mentor, Property 9: Readiness score is bounded

// **Validates: Requirements 8.7**

describe('Property 9: Readiness score is bounded', () => {
  const testCaseResultArb = fc.record({
    testCaseId: fc.string({ minLength: 1, maxLength: 20 }),
    passed: fc.boolean(),
    expected: fc.anything(),
    actual: fc.anything(),
  });

  const realisticSnippets = [
    'for (let i = 0; i < nums.length; i++) { sum += nums[i]; }',
    'for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) { count++; } }',
    'const map = new Map(); for (const x of arr) { map.set(x, true); }',
    'const seen = new Set(); nums.forEach(n => seen.add(n));',
    'return nums[0] + nums[1];',
    'while (left < right) { left++; right--; }',
  ];

  const codeArb = fc.oneof(
    ...realisticSnippets.map((s) => fc.constant(`function solve(nums, target) {\n  ${s}\n}`)),
    fc.string({ minLength: 0, maxLength: 300 }).map(
      (body) => `function solve(nums, target) {\n  ${body}\n}`
    ),
    fc.constant(''),
  );

  it('readinessScore is a number between 0 and 100 inclusive for any combination of inputs', () => {
    fc.assert(
      fc.property(
        fc.array(testCaseResultArb, { minLength: 1, maxLength: 20 }),
        codeArb,
        fc.nat({ max: 7200 }),
        (results, code, elapsedTime) => {
          const debrief = generateDebrief({
            problem: twoSumProblem,
            code,
            results,
            elapsedTime,
          });

          expect(typeof debrief.readinessScore).toBe('number');
          expect(Number.isNaN(debrief.readinessScore)).toBe(false);
          expect(debrief.readinessScore).toBeGreaterThanOrEqual(0);
          expect(debrief.readinessScore).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: enhanced-debrief-and-problems, Property 4: Debrief service passes through codeSolutions without modification
// **Validates: Requirements 3.3, 3.4**
describe('Property 4: Debrief service passes through codeSolutions without modification', () => {
  it('alternativeApproaches in debrief output preserves codeSolutions identically from the input problem', () => {
    const languageKeysArb = fc.subarray(['javascript', 'python', 'java'], { minLength: 1 });
    const codeStringArb = fc.string({ minLength: 1, maxLength: 200 });

    const codeSolutionsArb = languageKeysArb.chain((keys) =>
      fc.tuple(...keys.map(() => codeStringArb)).map((values) => {
        const solutions = {};
        keys.forEach((key, i) => {
          solutions[key] = values[i];
        });
        return solutions;
      })
    );

    const approachArb = fc.record({
      name: fc.string({ minLength: 1, maxLength: 50 }),
      description: fc.string({ minLength: 1, maxLength: 200 }),
      timeComplexity: fc.constantFrom('O(1)', 'O(n)', 'O(n^2)', 'O(n log n)'),
      spaceComplexity: fc.constantFrom('O(1)', 'O(n)', 'O(n^2)'),
      codeSolutions: codeSolutionsArb,
    });

    const problemArb = fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
      difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
      description: fc.string({ minLength: 1, maxLength: 200 }),
      examples: fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
      constraints: fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
      starterCode: fc.constant('function solve() {}'),
      sampleTestCases: fc.constant([]),
      hiddenTestCases: fc.constant([]),
      hints: fc.constant([]),
      debrief: fc.record({
        alternativeApproaches: fc.array(approachArb, { minLength: 1, maxLength: 5 }),
        edgeCases: fc.constant([]),
        optimalTimeComplexity: fc.constant('O(n)'),
        optimalSpaceComplexity: fc.constant('O(n)'),
      }),
    });

    fc.assert(
      fc.property(problemArb, (problem) => {
        const debrief = generateDebrief({
          problem,
          code: 'function solve() { return 1; }',
          results: [{ testCaseId: 't1', passed: true, expected: 1, actual: 1 }],
          elapsedTime: 120,
        });

        const inputApproaches = problem.debrief.alternativeApproaches;
        const outputApproaches = debrief.alternativeApproaches;

        expect(outputApproaches).toHaveLength(inputApproaches.length);

        for (let i = 0; i < inputApproaches.length; i++) {
          expect(outputApproaches[i].codeSolutions).toEqual(inputApproaches[i].codeSolutions);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: python-language-support, Property 5: Python complexity analysis detects correct patterns
// **Validates: Requirements 8.1, 8.2**
describe('Property 5: Python complexity analysis detects correct patterns', () => {
  const bigOPattern = /^O\(.+\)$/;

  // Realistic Python snippets covering known patterns
  const pythonSnippets = [
    // for x in → O(n) time
    'for x in nums:\n        total += x',
    // while → O(n) time
    'while left < right:\n        left += 1',
    // list comprehension → O(n) time, O(n) space
    'result = [x * 2 for x in nums]',
    // nested for loops → O(n^2) time
    'for i in range(len(nums)):\n        for j in range(len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]',
    // dict() → O(n) space
    'seen = dict()\n    for x in nums:\n        seen[x] = True',
    // set() → O(n) space
    'unique = set()\n    for x in nums:\n        unique.add(x)',
    // {} as dict → O(n) space
    'lookup = {}\n    for i, v in enumerate(nums):\n        lookup[v] = i',
    // [] with .append() → O(n) space
    'result = []\n    for x in nums:\n        result.append(x * 2)',
    // no loops → O(1) time
    'return nums[0] + nums[1]',
    // simple conditional → O(1) time, O(1) space
    'if len(nums) == 0:\n        return None\n    return nums[0]',
    // nested while loops → O(n^2) time
    'i = 0\n    while i < len(nums):\n        j = 0\n        while j < len(nums):\n            j += 1\n        i += 1',
    // list comprehension with condition → O(n) time, O(n) space
    'evens = [x for x in nums if x % 2 == 0]',
  ];

  const pythonCodeArb = fc.oneof(
    ...pythonSnippets.map((snippet) => fc.constant(snippet)),
    fc.string({ minLength: 0, maxLength: 200 })
  ).map((body) => `def solve(nums, target):\n    ${body}`);

  it('timeComplexity and spaceComplexity each match O(...) for any Python code with language="python"', () => {
    fc.assert(
      fc.property(pythonCodeArb, (code) => {
        const debrief = generateDebrief({
          problem: twoSumProblem,
          code,
          results: [
            { testCaseId: 't1', passed: true, expected: [0, 1], actual: [0, 1] },
          ],
          elapsedTime: 120,
          language: 'python',
        });

        expect(debrief.timeComplexity).toMatch(bigOPattern);
        expect(debrief.spaceComplexity).toMatch(bigOPattern);
      }),
      { numRuns: 100 }
    );
  });

  it('detects Python for-in loops as O(n) time complexity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'def solve(nums, target):\n    for x in nums:\n        total += x',
          'def solve(nums, target):\n    for i in range(len(nums)):\n        pass',
          'def solve(nums, target):\n    for key in my_dict:\n        print(key)'
        ),
        (code) => {
          const debrief = generateDebrief({
            problem: twoSumProblem,
            code,
            results: [{ testCaseId: 't1', passed: true, expected: [0, 1], actual: [0, 1] }],
            elapsedTime: 60,
            language: 'python',
          });
          expect(debrief.timeComplexity).toBe('O(n)');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detects Python nested loops as O(n^2) time complexity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'def solve(nums, target):\n    for i in range(len(nums)):\n        for j in range(len(nums)):\n            pass',
          'def solve(nums, target):\n    for x in nums:\n        for y in nums:\n            if x + y == target:\n                return True'
        ),
        (code) => {
          const debrief = generateDebrief({
            problem: twoSumProblem,
            code,
            results: [{ testCaseId: 't1', passed: true, expected: [0, 1], actual: [0, 1] }],
            elapsedTime: 60,
            language: 'python',
          });
          expect(debrief.timeComplexity).toBe('O(n^2)');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detects Python dict/set/list patterns as O(n) space complexity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'def solve(nums, target):\n    seen = dict()\n    for x in nums:\n        seen[x] = True',
          'def solve(nums, target):\n    unique = set()\n    for x in nums:\n        unique.add(x)',
          'def solve(nums, target):\n    lookup = {}\n    for v in nums:\n        lookup[v] = 1',
          'def solve(nums, target):\n    result = []\n    for x in nums:\n        result.append(x)'
        ),
        (code) => {
          const debrief = generateDebrief({
            problem: twoSumProblem,
            code,
            results: [{ testCaseId: 't1', passed: true, expected: [0, 1], actual: [0, 1] }],
            elapsedTime: 60,
            language: 'python',
          });
          expect(debrief.spaceComplexity).toBe('O(n)');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detects no-loop Python code as O(1) time complexity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'def solve(nums, target):\n    return nums[0] + nums[1]',
          'def solve(nums, target):\n    if len(nums) == 0:\n        return None\n    return nums[0]',
          'def solve(nums, target):\n    x = nums[0]\n    y = nums[1]\n    return x + y'
        ),
        (code) => {
          const debrief = generateDebrief({
            problem: twoSumProblem,
            code,
            results: [{ testCaseId: 't1', passed: true, expected: [0, 1], actual: [0, 1] }],
            elapsedTime: 60,
            language: 'python',
          });
          expect(debrief.timeComplexity).toBe('O(1)');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: python-language-support, Property 6: Debrief produces valid result for any language
// **Validates: Requirements 8.4**
describe('Property 6: Debrief produces valid result for any language', () => {
  const requiredFields = [
    'correctness',
    'timeComplexity',
    'spaceComplexity',
    'codeFeedback',
    'missedEdgeCases',
    'alternativeApproaches',
    'readinessScore',
    'elapsedTime',
  ];

  const realisticCodeSnippets = [
    // Python snippets
    'def solve(nums, target):\n    for x in nums:\n        if x == target:\n            return True',
    'def solve(nums, target):\n    seen = dict()\n    for x in nums:\n        seen[x] = True',
    'def solve(nums, target):\n    return [x * 2 for x in nums]',
    // JavaScript snippets
    'function solve(nums, target) {\n  for (let i = 0; i < nums.length; i++) { sum += nums[i]; }\n}',
    'function solve(nums, target) {\n  const map = new Map();\n  nums.forEach(n => map.set(n, true));\n}',
    'function solve(nums, target) {\n  return nums[0] + nums[1];\n}',
  ];

  const codeArb = fc.oneof(
    fc.constant(''),
    ...realisticCodeSnippets.map((s) => fc.constant(s)),
    fc.string({ minLength: 0, maxLength: 300 })
  );

  const languageArb = fc.constantFrom('python', 'javascript');

  const testCaseResultArb = fc.record({
    testCaseId: fc.string({ minLength: 1, maxLength: 20 }),
    passed: fc.boolean(),
    expected: fc.anything(),
    actual: fc.anything(),
  });

  it('returns a valid debrief object with all required fields for any code and any supported language', () => {
    fc.assert(
      fc.property(
        codeArb,
        languageArb,
        fc.array(testCaseResultArb, { minLength: 0, maxLength: 10 }),
        fc.nat({ max: 7200 }),
        (code, language, results, elapsedTime) => {
          const debrief = generateDebrief({
            problem: twoSumProblem,
            code,
            results,
            elapsedTime,
            language,
          });

          // All required fields must be present
          for (const field of requiredFields) {
            expect(debrief).toHaveProperty(field);
          }

          // correctness should have passed, total, percentage fields
          expect(debrief.correctness).toHaveProperty('passed');
          expect(debrief.correctness).toHaveProperty('total');
          expect(debrief.correctness).toHaveProperty('percentage');
          expect(typeof debrief.correctness.passed).toBe('number');
          expect(typeof debrief.correctness.total).toBe('number');
          expect(typeof debrief.correctness.percentage).toBe('number');

          // timeComplexity and spaceComplexity should be strings
          expect(typeof debrief.timeComplexity).toBe('string');
          expect(typeof debrief.spaceComplexity).toBe('string');

          // codeFeedback should be an array
          expect(Array.isArray(debrief.codeFeedback)).toBe(true);

          // readinessScore should be a number between 0 and 100
          expect(typeof debrief.readinessScore).toBe('number');
          expect(debrief.readinessScore).toBeGreaterThanOrEqual(0);
          expect(debrief.readinessScore).toBeLessThanOrEqual(100);

          // elapsedTime should be present
          expect(debrief.elapsedTime).toBe(elapsedTime);
        }
      ),
      { numRuns: 100 }
    );
  });
});
