import problems from '../../data/problems.json';

// Validates: Requirements 3.1, 3.2, 3.3
describe('Python starter code data validation', () => {
  const expectedProblems = [
    {
      id: 'two-sum',
      pythonFn: 'two_sum',
      jsStarterCode: 'function twoSum(nums, target) {\n  // Write your solution here\n}',
    },
    {
      id: 'valid-parentheses',
      pythonFn: 'is_valid',
      jsStarterCode: 'function isValid(s) {\n  // Write your solution here\n}',
    },
    {
      id: 'container-with-most-water',
      pythonFn: 'max_area',
      jsStarterCode: 'function maxArea(height) {\n  // Write your solution here\n}',
    },
    {
      id: 'longest-substring-without-repeating',
      pythonFn: 'length_of_longest_substring',
      jsStarterCode: 'function lengthOfLongestSubstring(s) {\n  // Write your solution here\n}',
    },
    {
      id: 'merge-intervals',
      pythonFn: 'merge',
      jsStarterCode: 'function merge(intervals) {\n  // Write your solution here\n}',
    },
  ];

  // Requirement 3.1: All 5 problems have starterCodePython as a non-empty string
  describe('starterCodePython field presence', () => {
    it.each(expectedProblems.map((p) => p.id))(
      '%s should have a starterCodePython field that is a non-empty string',
      (problemId) => {
        const problem = problems.find((p) => p.id === problemId);
        expect(problem).toBeDefined();
        expect(problem).toHaveProperty('starterCodePython');
        expect(typeof problem.starterCodePython).toBe('string');
        expect(problem.starterCodePython.length).toBeGreaterThan(0);
      }
    );
  });

  // Requirement 3.2: Each Python starter code contains a def statement with a snake_case function name
  describe('Python starter code contains def with snake_case function name', () => {
    it.each(expectedProblems)(
      '$id should have a def statement with snake_case function name "$pythonFn"',
      ({ id, pythonFn }) => {
        const problem = problems.find((p) => p.id === id);
        const code = problem.starterCodePython;

        // Verify it contains a def statement
        expect(code).toMatch(/def\s+\w+\s*\(/);

        // Verify the function name is snake_case (lowercase letters, digits, underscores; no uppercase)
        const fnNameMatch = code.match(/def\s+(\w+)\s*\(/);
        expect(fnNameMatch).not.toBeNull();
        const fnName = fnNameMatch[1];
        expect(fnName).toMatch(/^[a-z][a-z0-9_]*$/);

        // Verify it matches the expected function name
        expect(fnName).toBe(pythonFn);
      }
    );
  });

  // Requirement 3.3: Existing JavaScript starterCode fields are unchanged
  describe('JavaScript starterCode fields are preserved', () => {
    it.each(expectedProblems)(
      '$id should have its original JavaScript starterCode unchanged',
      ({ id, jsStarterCode }) => {
        const problem = problems.find((p) => p.id === id);
        expect(problem).toHaveProperty('starterCode');
        expect(typeof problem.starterCode).toBe('string');
        expect(problem.starterCode).toBe(jsStarterCode);
      }
    );
  });
});
