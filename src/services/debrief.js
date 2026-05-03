/**
 * Generates a comprehensive debrief after the user submits their solution.
 *
 * Computes:
 * - Correctness summary (passed/total/percentage)
 * - Heuristic time and space complexity analysis
 * - Code feedback (strengths and areas for improvement)
 * - Missed edge cases based on problem metadata
 * - Alternative approaches (pass-through from problem data)
 * - Readiness score (0–100) based on correctness, complexity, and elapsed time
 *
 * @param {{ problem: object, code: string, results: object[], elapsedTime: number, language?: string }} params
 * @returns {DebriefData}
 */
export function generateDebrief({ problem, code, results, elapsedTime, language = "javascript" }) {
  const safeCode = typeof code === "string" ? code.trim() : "";
  const safeResults = Array.isArray(results) ? results : [];

  const correctness = computeCorrectness(safeResults);

  // Empty or unparseable code → safe defaults
  if (safeCode.length === 0) {
    return {
      correctness,
      timeComplexity: "O(?)",
      spaceComplexity: "O(?)",
      codeFeedback: [],
      missedEdgeCases: detectMissedEdgeCases(problem, safeResults),
      alternativeApproaches: getAlternativeApproaches(problem),
      readinessScore: 0,
      elapsedTime,
    };
  }

  const timeComplexity = analyzeTimeComplexity(safeCode, language);
  const spaceComplexity = analyzeSpaceComplexity(safeCode, language);
  const codeFeedback = generateCodeFeedback(safeCode, language);
  const missedEdgeCases = detectMissedEdgeCases(problem, safeResults);
  const alternativeApproaches = getAlternativeApproaches(problem);
  const readinessScore = computeReadinessScore({
    correctness,
    timeComplexity,
    spaceComplexity,
    problem,
    elapsedTime,
  });

  return {
    correctness,
    timeComplexity,
    spaceComplexity,
    codeFeedback,
    missedEdgeCases,
    alternativeApproaches,
    readinessScore,
    elapsedTime,
  };
}

/**
 * Computes correctness summary from test results.
 * Handles empty results array (0/0 = 0%).
 *
 * @param {object[]} results
 * @returns {{ passed: number, total: number, percentage: number }}
 */
function computeCorrectness(results) {
  const total = results.length;
  const passed = results.filter((r) => r.passed === true).length;
  const percentage = total === 0 ? 0 : (passed / total) * 100;

  return { passed, total, percentage };
}

/**
 * Heuristic time complexity analysis based on code patterns.
 * Checks for nested loops, single loops, or no loops.
 *
 * @param {string} code
 * @param {string} language
 * @returns {string} Big-O notation string
 */
function analyzeTimeComplexity(code, language = "javascript") {
  // Check for nested loops → O(n²)
  const hasNestedLoops = detectNestedLoops(code, language);
  if (hasNestedLoops) return "O(n^2)";

  let hasSingleLoop = false;

  if (language === "python") {
    // Python loop patterns: for x in, while, list comprehensions
    hasSingleLoop =
      /\bfor\s+\w+\s+in\b/.test(code) ||
      /\bwhile\s+/.test(code) ||
      /\[.*\bfor\b.*\bin\b/.test(code);
  } else {
    // JavaScript loop patterns
    hasSingleLoop =
      /\b(for|while)\s*\(/.test(code) ||
      /\.(forEach|map|filter|reduce|some|every|find|findIndex)\s*\(/.test(code);
  }

  if (hasSingleLoop) return "O(n)";

  // No loop detected → O(1)
  return "O(1)";
}

/**
 * Detects nested loop patterns in code.
 * For JavaScript: looks for two loop constructs where one is inside the other using brace depth.
 * For Python: uses indentation-based nesting detection since Python doesn't use braces.
 *
 * @param {string} code
 * @param {string} language
 * @returns {boolean}
 */
function detectNestedLoops(code, language = "javascript") {
  if (language === "python") {
    return detectNestedLoopsPython(code);
  }

  const loopPattern = /\b(for|while)\s*\(/g;
  const matches = [];
  let match;

  while ((match = loopPattern.exec(code)) !== null) {
    matches.push(match.index);
  }

  // If there are 2+ loop keywords, check if they're nested
  // by looking at brace depth
  if (matches.length < 2) return false;

  let depth = 0;
  let insideLoop = false;

  for (let i = 0; i < code.length; i++) {
    // Check if we're at a loop keyword start
    if (matches.includes(i)) {
      if (insideLoop && depth > 0) {
        return true; // Found a loop inside another loop
      }
    }

    if (code[i] === "{") {
      if (matches.some((m) => m < i && i - m < 50) && !insideLoop) {
        insideLoop = true;
      }
      depth++;
    } else if (code[i] === "}") {
      depth--;
      if (depth === 0) {
        insideLoop = false;
      }
    }
  }

  return false;
}

/**
 * Detects nested loops in Python code using indentation-based analysis.
 * Python uses indentation instead of braces, so we track indent levels of loop statements.
 *
 * @param {string} code
 * @returns {boolean}
 */
function detectNestedLoopsPython(code) {
  const lines = code.split("\n");
  const loopPattern = /^(\s*)(for\s+\w+\s+in\b|while\s+)/;

  // Track indent levels of active loops
  const loopIndents = [];

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;

    const match = line.match(loopPattern);
    if (match) {
      const indent = match[1].length;

      // Remove any loops that are at the same or deeper indent level
      // (they are sibling or child loops that have ended)
      while (loopIndents.length > 0 && loopIndents[loopIndents.length - 1] >= indent) {
        loopIndents.pop();
      }

      if (loopIndents.length > 0) {
        // There's already a loop at a shallower indent level → nested
        return true;
      }

      loopIndents.push(indent);
    }
  }

  return false;
}

/**
 * Heuristic space complexity analysis based on code patterns.
 * Checks for data structure creation (Map, Set, objects, arrays).
 *
 * @param {string} code
 * @param {string} language
 * @returns {string} Big-O notation string
 */
function analyzeSpaceComplexity(code, language = "javascript") {
  if (language === "python") {
    // Python data structure patterns

    // Check for dict() or set() constructor calls → O(n)
    if (/\bdict\s*\(/.test(code) || /\bset\s*\(/.test(code)) return "O(n)";

    // Check for {} used as dict (assignment to variable with {} that isn't a set literal)
    if (/=\s*\{\s*\}/.test(code)) return "O(n)";

    // Check for [] with .append( → list being built up → O(n)
    if (/\[\s*\]/.test(code) && /\.append\s*\(/.test(code)) return "O(n)";

    // Check for list comprehension creating new list → O(n)
    if (/\[.*\bfor\b.*\bin\b/.test(code)) return "O(n)";

    // No extra data structures → O(1)
    return "O(1)";
  }

  // JavaScript data structure patterns

  // Check for Map/Set creation → O(n)
  const hasMapOrSet = /new\s+(Map|Set)\s*\(/.test(code);
  if (hasMapOrSet) return "O(n)";

  // Check for object used as hash map → O(n)
  const hasObjectLiteral = /(\w+)\s*\[\s*\w+/.test(code) && /=\s*\{\s*\}/.test(code);
  if (hasObjectLiteral) return "O(n)";

  // Check for array creation → O(n)
  const hasArrayCreation =
    /new\s+Array\s*\(/.test(code) ||
    /\[\s*\]/.test(code) && /\.push\s*\(/.test(code);
  if (hasArrayCreation) return "O(n)";

  // No extra data structures → O(1)
  return "O(1)";
}

/**
 * Generates code feedback identifying strengths and areas for improvement.
 *
 * @param {string} code
 * @param {string} language
 * @returns {string[]}
 */
function generateCodeFeedback(code, language = "javascript") {
  if (language === "python") {
    return generatePythonCodeFeedback(code);
  }

  const feedback = [];

  // Strengths
  if (/\b(Map|new\s+Map)\b/.test(code)) {
    feedback.push("Good use of hash map for O(n) lookup");
  }

  if (/\breturn\b/.test(code) && hasEarlyReturn(code)) {
    feedback.push("Good use of early return");
  }

  if (hasDescriptiveVariableNames(code)) {
    feedback.push("Good use of descriptive variable names");
  }

  // Areas for improvement
  if (!/\/\/|\/\*/.test(code)) {
    feedback.push("Consider adding comments to explain your approach");
  }

  if (!hasEdgeCaseHandling(code)) {
    feedback.push("Consider adding edge case handling for invalid inputs");
  }

  return feedback;
}

/**
 * Generates Python-specific code feedback.
 *
 * @param {string} code
 * @returns {string[]}
 */
function generatePythonCodeFeedback(code) {
  const feedback = [];

  // Strengths
  if (/\bdict\s*\(/.test(code) || /=\s*\{\s*\}/.test(code)) {
    feedback.push("Good use of dictionary for O(n) lookup");
  }

  if (/\breturn\b/.test(code) && hasPythonEarlyReturn(code)) {
    feedback.push("Good use of early return");
  }

  if (hasPythonDescriptiveVariableNames(code)) {
    feedback.push("Good use of descriptive variable names");
  }

  // Areas for improvement
  if (!/#/.test(code)) {
    feedback.push("Consider adding comments to explain your approach");
  }

  if (!hasPythonEdgeCaseHandling(code)) {
    feedback.push("Consider adding edge case handling for invalid inputs");
  }

  return feedback;
}

/**
 * Checks if Python code has an early return pattern (more than one return statement).
 *
 * @param {string} code
 * @returns {boolean}
 */
function hasPythonEarlyReturn(code) {
  const returnMatches = code.match(/\breturn\b/g);
  return returnMatches !== null && returnMatches.length > 1;
}

/**
 * Checks if Python code uses descriptive variable names (more than single characters).
 *
 * @param {string} code
 * @returns {boolean}
 */
function hasPythonDescriptiveVariableNames(code) {
  // Match Python variable assignments: name = value
  const varPattern = /^[ \t]*(\w+)\s*=/gm;
  const names = [];
  let match;
  while ((match = varPattern.exec(code)) !== null) {
    const name = match[1];
    // Skip keywords and dunder names
    if (!["def", "class", "if", "for", "while", "return", "import", "from"].includes(name)) {
      names.push(name);
    }
  }
  if (names.length === 0) return false;
  const descriptiveCount = names.filter((n) => n.length > 1).length;
  return descriptiveCount > names.length / 2;
}

/**
 * Checks if Python code has basic edge case handling patterns.
 *
 * @param {string} code
 * @returns {boolean}
 */
function hasPythonEdgeCaseHandling(code) {
  return (
    /\blen\s*\(/.test(code) && /[<>=!]=?\s*\d/.test(code) ||
    /\bif\s+not\b/.test(code) ||
    /is\s+None/.test(code) ||
    /is\s+not\s+None/.test(code)
  );
}

/**
 * Checks if the code has an early return pattern (return before the end of the function).
 *
 * @param {string} code
 * @returns {boolean}
 */
function hasEarlyReturn(code) {
  const returnMatches = code.match(/\breturn\b/g);
  return returnMatches !== null && returnMatches.length > 1;
}

/**
 * Checks if the code uses descriptive variable names (more than single characters).
 *
 * @param {string} code
 * @returns {boolean}
 */
function hasDescriptiveVariableNames(code) {
  const varDeclarations = code.match(/\b(let|const|var)\s+(\w+)/g);
  if (!varDeclarations || varDeclarations.length === 0) return false;

  const names = varDeclarations.map((d) => d.replace(/^(let|const|var)\s+/, ""));
  const descriptiveCount = names.filter((n) => n.length > 1).length;

  return descriptiveCount > names.length / 2;
}

/**
 * Checks if the code has basic edge case handling patterns.
 *
 * @param {string} code
 * @returns {boolean}
 */
function hasEdgeCaseHandling(code) {
  return (
    /\.length\s*(===|==|<|<=|>|>=)\s*\d/.test(code) ||
    /if\s*\(\s*!/.test(code) ||
    /===\s*(null|undefined)/.test(code) ||
    /(null|undefined)\s*===/.test(code)
  );
}

/**
 * Detects missed edge cases by comparing problem edge cases against test results.
 * If any hidden test case failed, maps it to the corresponding edge case description.
 *
 * @param {object} problem
 * @param {object[]} results
 * @returns {string[]}
 */
function detectMissedEdgeCases(problem, results) {
  const edgeCases = problem?.debrief?.edgeCases ?? [];
  const hiddenTestCases = problem?.hiddenTestCases ?? [];

  if (results.length === 0) return [...edgeCases];

  const failedTestIds = new Set(
    results.filter((r) => r.passed !== true).map((r) => r.testCaseId)
  );

  if (failedTestIds.size === 0) return [];

  const missed = [];

  for (const tc of hiddenTestCases) {
    if (failedTestIds.has(tc.id) && tc.description) {
      // Try to match the test case description to an edge case
      const matchingEdgeCase = edgeCases.find((ec) =>
        ec.toLowerCase().includes(tc.description.toLowerCase()) ||
        tc.description.toLowerCase().includes(ec.toLowerCase())
      );

      if (matchingEdgeCase) {
        missed.push(matchingEdgeCase);
      } else {
        missed.push(tc.description);
      }
    }
  }

  return missed;
}

/**
 * Returns alternative approaches from the problem's debrief config.
 *
 * @param {object} problem
 * @returns {object[]}
 */
function getAlternativeApproaches(problem) {
  return problem?.debrief?.alternativeApproaches ?? [];
}

/**
 * Computes a readiness score (0–100) based on:
 * - Correctness percentage (60% weight)
 * - Complexity match bonus (20% weight) — if user's complexity matches optimal
 * - Time bonus (20% weight) — faster completion = higher score
 *
 * @param {{ correctness: object, timeComplexity: string, spaceComplexity: string, problem: object, elapsedTime: number }} params
 * @returns {number}
 */
function computeReadinessScore({
  correctness,
  timeComplexity,
  spaceComplexity,
  problem,
  elapsedTime,
}) {
  // Correctness component (60% weight)
  const correctnessScore = correctness.percentage * 0.6;

  // Complexity match bonus (20% weight)
  const optimalTime = problem?.debrief?.optimalTimeComplexity ?? "";
  const optimalSpace = problem?.debrief?.optimalSpaceComplexity ?? "";

  let complexityScore = 0;
  if (timeComplexity === optimalTime) complexityScore += 10;
  if (spaceComplexity === optimalSpace) complexityScore += 10;

  // Time bonus (20% weight)
  // Assume a target time of 30 minutes (1800 seconds) for an easy problem
  const targetTime = 1800;
  let timeScore = 0;
  if (elapsedTime <= targetTime) {
    timeScore = 20;
  } else if (elapsedTime <= targetTime * 2) {
    // Linear decay from 20 to 0 between targetTime and 2x targetTime
    timeScore = 20 * (1 - (elapsedTime - targetTime) / targetTime);
  }

  const rawScore = correctnessScore + complexityScore + Math.max(0, timeScore);

  // Clamp to 0-100
  return Math.round(Math.min(100, Math.max(0, rawScore)));
}
