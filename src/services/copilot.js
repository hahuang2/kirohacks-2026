const FALLBACK_MESSAGE = "Try breaking the problem into smaller steps.";

/**
 * Generates a progressive hint based on the problem, user's current code,
 * and previously given hints.
 *
 * Strategy:
 * 1. Check how many hints have already been given (previousHints.length)
 * 2. If the user's code already contains approach keywords, skip to a more specific hint
 * 3. Return the next progressive hint that hasn't been given yet
 * 4. If all progressive hints have been given, return the keyInsight
 * 5. If keyInsight has also been given, return a fallback message
 * 6. NEVER return complete solution code
 *
 * @param {{ problem: object, code: string, previousHints: string[] }} params
 * @returns {string} hint text
 */
export function generateHint({ problem, code, previousHints }) {
  const { progressiveHints, keyInsight, approachKeywords } = problem.hints;

  // Determine how far to skip based on keyword detection in user code
  const skipCount = countKeywordMatches(code, approachKeywords);

  // Find the next progressive hint that hasn't been given yet,
  // starting from the skip offset based on keyword matches
  const startIndex = Math.min(skipCount, progressiveHints.length);

  for (let i = startIndex; i < progressiveHints.length; i++) {
    if (!previousHints.includes(progressiveHints[i])) {
      return progressiveHints[i];
    }
  }

  // Also check earlier hints in case they were skipped but not yet given
  for (let i = 0; i < startIndex; i++) {
    if (!previousHints.includes(progressiveHints[i])) {
      return progressiveHints[i];
    }
  }

  // All progressive hints exhausted — offer the key insight
  if (!previousHints.includes(keyInsight)) {
    return keyInsight;
  }

  // Everything has been given — return the fallback
  return FALLBACK_MESSAGE;
}

/**
 * Counts how many approach keywords appear in the user's code (case-insensitive).
 * Used to decide whether the user is already on the right track and can skip
 * early, vague hints.
 *
 * @param {string} code
 * @param {string[]} keywords
 * @returns {number}
 */
function countKeywordMatches(code, keywords) {
  const lowerCode = code.toLowerCase();
  return keywords.filter((kw) => lowerCode.includes(kw.toLowerCase())).length;
}
