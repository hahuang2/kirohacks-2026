import { generateHint } from '../../services/copilot.js';
import problems from '../../data/problems.json';

const twoSum = problems.find((p) => p.id === 'two-sum');

describe('Copilot hint progression', () => {
  // Validates: Requirements 6.3
  it('first call with no previous hints returns the first progressive hint', () => {
    const hint = generateHint({
      problem: twoSum,
      code: '',
      previousHints: [],
    });

    expect(hint).toBe(twoSum.hints.progressiveHints[0]);
  });

  // Validates: Requirements 6.3
  it('successive calls with accumulating previousHints return different hints each time', () => {
    const previousHints = [];
    const receivedHints = [];

    // Request hints one at a time, accumulating previousHints
    for (let i = 0; i < twoSum.hints.progressiveHints.length + 1; i++) {
      const hint = generateHint({
        problem: twoSum,
        code: '',
        previousHints: [...previousHints],
      });

      // Each hint should be different from all previously received hints
      expect(receivedHints).not.toContain(hint);

      receivedHints.push(hint);
      previousHints.push(hint);
    }

    // We should have received all progressive hints plus the keyInsight
    expect(receivedHints).toEqual([
      ...twoSum.hints.progressiveHints,
      twoSum.hints.keyInsight,
    ]);
  });

  // Validates: Requirements 6.3
  it('returns the fallback message when all hints are exhausted', () => {
    const allHints = [
      ...twoSum.hints.progressiveHints,
      twoSum.hints.keyInsight,
    ];

    const hint = generateHint({
      problem: twoSum,
      code: '',
      previousHints: allHints,
    });

    expect(hint).toBe('Try breaking the problem into smaller steps.');
  });

  // Validates: Requirements 6.3
  it('when code contains approach keywords, hints may skip ahead to more specific ones', () => {
    // Code that contains one approach keyword ("map") should skip the first hint
    const codeWithKeyword = 'const map = new Map();';

    const hintWithKeyword = generateHint({
      problem: twoSum,
      code: codeWithKeyword,
      previousHints: [],
    });

    const hintWithoutKeyword = generateHint({
      problem: twoSum,
      code: '',
      previousHints: [],
    });

    // The hint with keyword detection should differ from the first progressive hint
    // (it skips ahead), while the hint without keywords should be the first one
    expect(hintWithoutKeyword).toBe(twoSum.hints.progressiveHints[0]);
    expect(hintWithKeyword).not.toBe(twoSum.hints.progressiveHints[0]);
  });
});
