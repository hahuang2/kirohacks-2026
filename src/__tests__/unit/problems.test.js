import problems from '../../data/problems.json';

describe('Problem data integrity', () => {
  // Validates: Requirements 1.2
  it('should contain at least one problem', () => {
    expect(Array.isArray(problems)).toBe(true);
    expect(problems.length).toBeGreaterThanOrEqual(1);
  });

  describe('Two Sum problem', () => {
    const twoSum = problems.find((p) => p.id === 'two-sum');

    it('should exist in the problem store', () => {
      expect(twoSum).toBeDefined();
    });

    // Verify all required fields per the Problem interface
    it('should have all required top-level fields', () => {
      expect(twoSum).toHaveProperty('id');
      expect(twoSum).toHaveProperty('title');
      expect(twoSum).toHaveProperty('difficulty');
      expect(twoSum).toHaveProperty('description');
      expect(twoSum).toHaveProperty('examples');
      expect(twoSum).toHaveProperty('constraints');
      expect(twoSum).toHaveProperty('starterCode');
      expect(twoSum).toHaveProperty('sampleTestCases');
      expect(twoSum).toHaveProperty('hiddenTestCases');
      expect(twoSum).toHaveProperty('hints');
      expect(twoSum).toHaveProperty('debrief');
    });

    it('should have correct types for top-level fields', () => {
      expect(typeof twoSum.id).toBe('string');
      expect(typeof twoSum.title).toBe('string');
      expect(['Easy', 'Medium', 'Hard']).toContain(twoSum.difficulty);
      expect(typeof twoSum.description).toBe('string');
      expect(Array.isArray(twoSum.examples)).toBe(true);
      expect(Array.isArray(twoSum.constraints)).toBe(true);
      expect(typeof twoSum.starterCode).toBe('string');
    });

    // Verify sampleTestCases is a non-empty array with required fields
    it('should have non-empty sampleTestCases with id, input, expected fields', () => {
      expect(Array.isArray(twoSum.sampleTestCases)).toBe(true);
      expect(twoSum.sampleTestCases.length).toBeGreaterThan(0);

      for (const tc of twoSum.sampleTestCases) {
        expect(tc).toHaveProperty('id');
        expect(tc).toHaveProperty('input');
        expect(tc).toHaveProperty('expected');
        expect(typeof tc.id).toBe('string');
      }
    });

    // Verify hiddenTestCases is a non-empty array with required fields
    it('should have non-empty hiddenTestCases with id, input, expected fields', () => {
      expect(Array.isArray(twoSum.hiddenTestCases)).toBe(true);
      expect(twoSum.hiddenTestCases.length).toBeGreaterThan(0);

      for (const tc of twoSum.hiddenTestCases) {
        expect(tc).toHaveProperty('id');
        expect(tc).toHaveProperty('input');
        expect(tc).toHaveProperty('expected');
        expect(typeof tc.id).toBe('string');
      }
    });

    // Verify hints has progressiveHints, keyInsight, approachKeywords
    it('should have hints with progressiveHints, keyInsight, and approachKeywords', () => {
      expect(twoSum.hints).toHaveProperty('progressiveHints');
      expect(twoSum.hints).toHaveProperty('keyInsight');
      expect(twoSum.hints).toHaveProperty('approachKeywords');

      expect(Array.isArray(twoSum.hints.progressiveHints)).toBe(true);
      expect(twoSum.hints.progressiveHints.length).toBeGreaterThan(0);
      expect(typeof twoSum.hints.keyInsight).toBe('string');
      expect(Array.isArray(twoSum.hints.approachKeywords)).toBe(true);
      expect(twoSum.hints.approachKeywords.length).toBeGreaterThan(0);
    });

    // Verify debrief has optimalTimeComplexity, optimalSpaceComplexity, edgeCases, alternativeApproaches
    it('should have debrief with optimalTimeComplexity, optimalSpaceComplexity, edgeCases, and alternativeApproaches', () => {
      expect(twoSum.debrief).toHaveProperty('optimalTimeComplexity');
      expect(twoSum.debrief).toHaveProperty('optimalSpaceComplexity');
      expect(twoSum.debrief).toHaveProperty('edgeCases');
      expect(twoSum.debrief).toHaveProperty('alternativeApproaches');

      expect(typeof twoSum.debrief.optimalTimeComplexity).toBe('string');
      expect(typeof twoSum.debrief.optimalSpaceComplexity).toBe('string');
      expect(Array.isArray(twoSum.debrief.edgeCases)).toBe(true);
      expect(twoSum.debrief.edgeCases.length).toBeGreaterThan(0);
      expect(Array.isArray(twoSum.debrief.alternativeApproaches)).toBe(true);
      expect(twoSum.debrief.alternativeApproaches.length).toBeGreaterThan(0);
    });
  });
});

// Feature: enhanced-debrief-and-problems, Property 5: All problem approaches include all supported languages
// **Validates: Requirements 2.1, 3.2**
describe('Property 5: All problem approaches include all supported languages', () => {
  const supportedLanguages = ['javascript', 'python', 'java'];

  it('every alternative approach across all problems should have codeSolutions for all supported languages', () => {
    for (const problem of problems) {
      expect(problem.debrief).toBeDefined();
      expect(problem.debrief.alternativeApproaches).toBeDefined();
      expect(problem.debrief.alternativeApproaches.length).toBeGreaterThan(0);

      for (const approach of problem.debrief.alternativeApproaches) {
        expect(approach.codeSolutions).toBeDefined();

        for (const lang of supportedLanguages) {
          expect(approach.codeSolutions).toHaveProperty(lang);
          expect(typeof approach.codeSolutions[lang]).toBe('string');
          expect(approach.codeSolutions[lang].length).toBeGreaterThan(0);
        }
      }
    }
  });
});

// Feature: enhanced-debrief-and-problems, Property 6: Every problem in the store has complete data
// **Validates: Requirements 4.5**
describe('Property 6: Every problem in the store has complete data', () => {
  it('every problem should have non-empty values for all required fields', () => {
    for (const problem of problems) {
      // String fields must be non-empty strings
      expect(typeof problem.id).toBe('string');
      expect(problem.id.length).toBeGreaterThan(0);

      expect(typeof problem.title).toBe('string');
      expect(problem.title.length).toBeGreaterThan(0);

      expect(typeof problem.difficulty).toBe('string');
      expect(problem.difficulty.length).toBeGreaterThan(0);

      expect(typeof problem.description).toBe('string');
      expect(problem.description.length).toBeGreaterThan(0);

      expect(typeof problem.starterCode).toBe('string');
      expect(problem.starterCode.length).toBeGreaterThan(0);

      // Array fields must be non-empty arrays
      expect(Array.isArray(problem.examples)).toBe(true);
      expect(problem.examples.length).toBeGreaterThan(0);

      expect(Array.isArray(problem.constraints)).toBe(true);
      expect(problem.constraints.length).toBeGreaterThan(0);

      expect(Array.isArray(problem.sampleTestCases)).toBe(true);
      expect(problem.sampleTestCases.length).toBeGreaterThan(0);

      expect(Array.isArray(problem.hiddenTestCases)).toBe(true);
      expect(problem.hiddenTestCases.length).toBeGreaterThan(0);

      // Hints must be present and non-empty
      expect(problem.hints).toBeDefined();
      expect(Array.isArray(problem.hints.progressiveHints)).toBe(true);
      expect(problem.hints.progressiveHints.length).toBeGreaterThan(0);
      expect(typeof problem.hints.keyInsight).toBe('string');
      expect(problem.hints.keyInsight.length).toBeGreaterThan(0);

      // Debrief must be present with alternativeApproaches containing codeSolutions
      expect(problem.debrief).toBeDefined();
      expect(typeof problem.debrief.optimalTimeComplexity).toBe('string');
      expect(problem.debrief.optimalTimeComplexity.length).toBeGreaterThan(0);
      expect(typeof problem.debrief.optimalSpaceComplexity).toBe('string');
      expect(problem.debrief.optimalSpaceComplexity.length).toBeGreaterThan(0);

      expect(Array.isArray(problem.debrief.alternativeApproaches)).toBe(true);
      expect(problem.debrief.alternativeApproaches.length).toBeGreaterThan(0);

      for (const approach of problem.debrief.alternativeApproaches) {
        expect(approach.codeSolutions).toBeDefined();
        expect(typeof approach.codeSolutions).toBe('object');
        expect(Object.keys(approach.codeSolutions).length).toBeGreaterThan(0);
      }
    }
  });
});
