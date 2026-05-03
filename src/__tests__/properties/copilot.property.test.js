// Feature: algo-mentor, Property 5: Hints do not contain complete solutions
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateHint } from '../../services/copilot.js';
import problems from '../../data/problems.json';

// **Validates: Requirements 6.4**

const twoSumProblem = problems.find((p) => p.id === 'two-sum');

/**
 * Checks whether a string contains a complete twoSum function implementation.
 * A "complete implementation" is defined as a function body named twoSum that
 * contains both iteration logic (for/while) and a return statement — the
 * minimum structure needed to actually solve the problem.
 */
function containsCompleteSolution(hint) {
  // Check for a function declaration or expression named twoSum with a body
  // that includes both a loop and a return statement
  const functionPattern = /function\s+twoSum\s*\([^)]*\)\s*\{[^}]*\bfor\b[^}]*\breturn\b[^}]*\}/s;
  const functionPatternAlt = /function\s+twoSum\s*\([^)]*\)\s*\{[^}]*\breturn\b[^}]*\bfor\b[^}]*\}/s;

  // Also check for arrow function style: const twoSum = (...) => { ... }
  const arrowPattern = /(?:const|let|var)\s+twoSum\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*\bfor\b[^}]*\breturn\b[^}]*\}/s;
  const arrowPatternAlt = /(?:const|let|var)\s+twoSum\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*\breturn\b[^}]*\bfor\b[^}]*\}/s;

  // Check for while-loop variants as well
  const whilePattern = /function\s+twoSum\s*\([^)]*\)\s*\{[^}]*\bwhile\b[^}]*\breturn\b[^}]*\}/s;
  const whilePatternAlt = /function\s+twoSum\s*\([^)]*\)\s*\{[^}]*\breturn\b[^}]*\bwhile\b[^}]*\}/s;

  return (
    functionPattern.test(hint) ||
    functionPatternAlt.test(hint) ||
    arrowPattern.test(hint) ||
    arrowPatternAlt.test(hint) ||
    whilePattern.test(hint) ||
    whilePatternAlt.test(hint)
  );
}

describe('Property 5: Hints do not contain complete solutions', () => {
  it('generateHint never returns a complete twoSum implementation for any code and previousHints', () => {
    fc.assert(
      fc.property(
        // Generate random code strings of various lengths (including empty)
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 0, maxLength: 200 }),
          fc.constant('function twoSum(nums, target) {\n  // partial\n}'),
          fc.constant('const map = new Map();'),
          fc.constant('for (let i = 0; i < nums.length; i++) {}'),
          fc.constant('function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n  }\n}')
        ),
        // Generate random arrays of previous hint strings
        fc.array(fc.string({ minLength: 0, maxLength: 100 }), { minLength: 0, maxLength: 10 }),
        (code, previousHints) => {
          const hint = generateHint({
            problem: twoSumProblem,
            code,
            previousHints,
          });

          // The hint must be a string
          expect(typeof hint).toBe('string');

          // The hint must NOT contain a complete twoSum implementation
          expect(containsCompleteSolution(hint)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
