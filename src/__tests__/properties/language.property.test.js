// Feature: python-language-support, Property 4: Python function name extraction
// Feature: python-language-support, Property 1: Starter code selection by language
import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import problems from '../../data/problems.json';

// **Validates: Requirements 4.2**

// Stub the Worker global before importing pythonRunner, which creates a
// singleton Web Worker at module scope.
vi.stubGlobal('Worker', class FakeWorker {
  addEventListener() {}
  removeEventListener() {}
  postMessage() {}
  terminate() {}
});

const { extractPythonFunctionName } = await import('../../runners/pythonRunner.js');

/**
 * Arbitrary that generates valid Python identifiers:
 * - Starts with a letter (a-z, A-Z) or underscore
 * - Followed by zero or more letters, digits, or underscores
 */
const firstChar = fc.mapToConstant(
  { num: 26, build: (v) => String.fromCharCode(97 + v) },  // a-z
  { num: 26, build: (v) => String.fromCharCode(65 + v) },  // A-Z
  { num: 1, build: () => '_' },                             // _
);

const restChar = fc.mapToConstant(
  { num: 26, build: (v) => String.fromCharCode(97 + v) },  // a-z
  { num: 26, build: (v) => String.fromCharCode(65 + v) },  // A-Z
  { num: 10, build: (v) => String.fromCharCode(48 + v) },  // 0-9
  { num: 1, build: () => '_' },                             // _
);

const pythonIdentifier = fc
  .tuple(firstChar, fc.array(restChar, { minLength: 0, maxLength: 30 }))
  .map(([first, rest]) => first + rest.join(''));

describe('Property 4: Python function name extraction', () => {
  it('correctly extracts the function name from any valid def statement', () => {
    fc.assert(
      fc.property(pythonIdentifier, (name) => {
        const code = `def ${name}(args):`;
        const extracted = extractPythonFunctionName(code);
        expect(extracted).toBe(name);
      }),
      { numRuns: 100 },
    );
  });

  it('returns null when code contains no def statement', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !/def\s+[a-zA-Z_]/.test(s)),
        (code) => {
          const extracted = extractPythonFunctionName(code);
          expect(extracted).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: python-language-support, Property 1: Starter code selection by language

// **Validates: Requirements 1.2, 1.3, 2.2**

/**
 * Helper that mirrors the App.jsx starter code selection logic.
 * Given a problem and a language, returns the appropriate starter code.
 */
function getStarterCode(problem, language) {
  return language === 'python'
    ? (problem.starterCodePython ?? '')
    : (problem.starterCode ?? '');
}

describe('Property 1: Starter code selection by language', () => {
  it('selects the correct starter code for any problem and language combination', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...problems),
        fc.constantFrom('python', 'javascript'),
        (problem, language) => {
          const result = getStarterCode(problem, language);

          if (language === 'python') {
            expect(result).toBe(problem.starterCodePython);
          } else {
            expect(result).toBe(problem.starterCode);
          }

          // Starter code should always be a non-empty string
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});
