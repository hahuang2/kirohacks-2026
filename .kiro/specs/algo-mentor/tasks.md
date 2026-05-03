# Implementation Plan: AlgoMentor

## Overview

Build the AlgoMentor MVP — a single-page React application that simulates a mock technical interview. Implementation proceeds from project scaffolding and data layer, through the runner system and services, to UI components, and finally integration wiring. Each task builds incrementally on previous work so there is no orphaned code.

## Tasks

- [x] 1. Scaffold project and configure tooling
  - Initialize a Vite + React project (JavaScript)
  - Install dependencies: `@monaco-editor/react`, `tailwindcss @tailwindcss/vite`, `fast-check` (dev), `vitest` (dev), `@testing-library/react` (dev), `@testing-library/jest-dom` (dev), `jsdom` (dev)
  - Configure Tailwind CSS via `@tailwindcss/vite` plugin and add `@import "tailwindcss"` to `src/index.css`
  - Configure Vitest in `vite.config.js` with jsdom environment
  - Create the directory structure: `src/components/`, `src/runners/`, `src/services/`, `src/data/`, `src/utils/`, `src/__tests__/properties/`, `src/__tests__/unit/`, `src/__tests__/integration/`
  - _Requirements: 9.1_

- [x] 2. Create problem data store
  - [x] 2.1 Create `src/data/problems.json` with the "Two Sum" problem definition
    - Include all required fields: `id`, `title`, `difficulty`, `description`, `examples`, `constraints`, `starterCode`, `sampleTestCases`, `hiddenTestCases`, `hints` (with `progressiveHints`, `keyInsight`, `approachKeywords`), and `debrief` (with `optimalTimeComplexity`, `optimalSpaceComplexity`, `edgeCases`, `alternativeApproaches`)
    - Provide at least 3 sample test cases and 5 hidden test cases covering edge cases (empty-ish arrays, negatives, duplicates)
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 Write unit tests for problem data integrity
    - Verify `problems.json` contains at least one problem
    - Verify the Two Sum problem has all required fields per the `Problem` interface
    - Verify `sampleTestCases` and `hiddenTestCases` are non-empty arrays with `id`, `input`, `expected` fields
    - _Requirements: 1.2_

- [x] 3. Implement runner system
  - [x] 3.1 Implement `src/runners/javascriptRunner.js`
    - Export `runJavaScript({ code, testCases, timeoutMs = 5000 })`
    - Use the `Function` constructor to evaluate user code
    - Wrap each test case execution in `Promise.race` with a timeout promise for the 5-second limit
    - Return `TestCaseResult` objects with `testCaseId`, `passed`, `expected`, `actual`, and optional `error`/`timedOut` fields
    - Catch runtime errors and return them as results with `passed: false` and `error` populated
    - Set `timedOut: true` when execution exceeds the time limit
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.4_

  - [x] 3.2 Implement `src/runners/index.js`
    - Export `runCode({ language, code, testCases })`
    - Dispatch to `runJavaScript` when `language === "javascript"`
    - Throw a descriptive error for unsupported language values
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.3 Write property test: Runner produces correct pass/fail results
    - **Property 1: Runner produces correct pass/fail results**
    - Generate simple arithmetic functions and matching test cases with known outputs using fast-check
    - Verify `passed` is `true` if and only if the function's return value deeply equals the expected output
    - **Validates: Requirements 3.1, 4.1**

  - [x] 3.4 Write property test: Runner results contain required fields
    - **Property 2: Runner results contain required fields**
    - Generate arbitrary code strings and test case arrays
    - Verify every result contains `testCaseId`, `passed` (boolean), `expected`, and `actual` fields
    - **Validates: Requirements 3.2, 4.2, 5.4**

  - [x] 3.5 Write property test: Runner captures runtime errors
    - **Property 3: Runner captures runtime errors**
    - Generate code strings that throw errors during execution
    - Verify the result has `passed: false` and a non-empty `error` string
    - **Validates: Requirements 3.3, 4.4**

  - [x] 3.6 Write property test: Runner dispatch correctness
    - **Property 4: Runner dispatch correctness**
    - Generate random language strings, code, and test cases
    - Verify `runCode` with `"javascript"` produces the same results as `runJavaScript` directly
    - Verify `runCode` with any other language string returns an error
    - **Validates: Requirements 5.2, 5.3**

  - [x] 3.7 Write unit tests for runner timeout handling
    - Test that an infinite loop returns a timeout error within a reasonable time
    - Test that a slow but valid function completes before the timeout
    - _Requirements: 3.4, 4.5_

- [x] 4. Checkpoint — Verify runner system
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement timer utility
  - [x] 5.1 Create `src/utils/timer.js`
    - Export `formatTime(seconds)` that returns a `MM:SS` string with zero-padded minutes and seconds
    - _Requirements: 7.2_

  - [x] 5.2 Write property test: Timer formatting
    - **Property 6: Timer formatting**
    - Generate non-negative integers using fast-check
    - Verify `formatTime` returns `MM:SS` where minutes = `Math.floor(seconds / 60)` and seconds portion = `seconds % 60`, both zero-padded to two digits
    - **Validates: Requirements 7.2**

- [x] 6. Implement copilot service
  - [x] 6.1 Implement `src/services/copilot.js`
    - Export `generateHint({ problem, code, previousHints })`
    - Use heuristic checks against `problem.hints.approachKeywords` and `problem.hints.progressiveHints` to select the next appropriate hint
    - Return a fallback message when no more hints are available
    - Never include complete solution code in the returned hint
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 6.2 Write property test: Hints do not contain complete solutions
    - **Property 5: Hints do not contain complete solutions**
    - Generate code strings at various completion stages using fast-check
    - Verify the returned hint does not contain a complete implementation of the solution function
    - **Validates: Requirements 6.4**

  - [x] 6.3 Write unit tests for copilot hint progression
    - Test that successive calls return different hints
    - Test that the fallback message is returned when hints are exhausted
    - _Requirements: 6.3_

- [x] 7. Implement debrief service
  - [x] 7.1 Implement `src/services/debrief.js`
    - Export `generateDebrief({ problem, code, results, elapsedTime })`
    - Compute correctness summary: `passed`, `total`, `percentage`
    - Implement heuristic complexity analysis returning Big-O notation strings (default to `"O(?)"` if undetermined)
    - Generate code feedback array identifying strengths and areas for improvement
    - Detect missed edge cases by comparing against `problem.debrief.edgeCases`
    - Include alternative approaches from `problem.debrief.alternativeApproaches`
    - Compute readiness score (0–100) based on correctness, complexity, and elapsed time
    - Handle empty or unparseable code with safe defaults (empty arrays, score of 0)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 7.2 Write property test: Correctness summary accuracy
    - **Property 7: Correctness summary accuracy**
    - Generate arrays of `TestCaseResult` objects with random pass/fail using fast-check
    - Verify `passed` equals count of `passed === true`, `total` equals array length, `percentage` equals `(passed / total) * 100`
    - **Validates: Requirements 8.1**

  - [x] 7.3 Write property test: Complexity analysis produces valid Big-O notation
    - **Property 8: Complexity analysis produces valid Big-O notation**
    - Generate non-empty code strings using fast-check
    - Verify `timeComplexity` and `spaceComplexity` each match the pattern `O(...)`
    - **Validates: Requirements 8.2, 8.3**

  - [x] 7.4 Write property test: Readiness score is bounded
    - **Property 9: Readiness score is bounded**
    - Generate full debrief inputs (test results, code strings, non-negative elapsed times) using fast-check
    - Verify `readinessScore` is a number between 0 and 100 inclusive
    - **Validates: Requirements 8.7**

  - [x] 7.5 Write unit tests for debrief edge cases
    - Test debrief with all tests passing vs. all failing
    - Test debrief with empty code string returns safe defaults
    - Test that elapsed time is included in the output
    - _Requirements: 8.1, 8.7, 8.8_

- [x] 8. Checkpoint — Verify services and utilities
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Build UI components
  - [x] 9.1 Implement `src/components/ProblemDisplay.jsx`
    - Accept `problem` and `loadError` props
    - Render problem title, difficulty badge, description, examples (input/output/explanation), and constraints
    - Render an error message when `loadError` is set and `problem` is null
    - _Requirements: 1.3, 1.5_

  - [x] 9.2 Implement `src/components/CodeEditor.jsx`
    - Accept `code` and `onChange` props
    - Render `@monaco-editor/react` configured for JavaScript syntax highlighting
    - Forward editor content changes to `onChange`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 9.3 Implement `src/components/ActionBar.jsx`
    - Accept `onRun`, `onSubmit`, `onGetHint`, and `isRunning` props
    - Render "Run", "Submit", and "Get Hint" buttons with clear labels
    - Disable buttons while `isRunning` is true to prevent double-clicks
    - _Requirements: 6.1, 9.3_

  - [x] 9.4 Implement `src/components/Timer.jsx`
    - Accept `running`, `elapsedTime`, and `onTick` props
    - Use `setInterval` to call `onTick` every second while `running` is true
    - Display elapsed time using `formatTime` from `src/utils/timer.js`
    - _Requirements: 7.1, 7.2_

  - [x] 9.5 Implement `src/components/TestResults.jsx`
    - Accept `results` prop (array of `TestCaseResult`)
    - Render each result with pass/fail indicator, expected output, actual output, and error message if present
    - _Requirements: 3.2, 4.2_

  - [x] 9.6 Implement `src/components/HintDisplay.jsx`
    - Accept `hints` prop (array of strings)
    - Render each hint in a visible display area
    - _Requirements: 6.5_

  - [x] 9.7 Implement `src/components/DebriefPanel.jsx`
    - Accept `debrief` and `onBack` props
    - Render correctness summary (passed/total), time complexity, space complexity, code feedback, missed edge cases, alternative approaches, readiness score, and elapsed time
    - Provide a "Back" button that calls `onBack`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 9.4_

- [ ] 10. Integrate App root component
  - [x] 10.1 Implement `src/App.jsx`
    - Manage all application state: `problem`, `code`, `testResults`, `hints`, `elapsedTime`, `timerRunning`, `view`, `debriefData`, `loadError`
    - Load problem data from `problems.json` on mount; set `loadError` on failure
    - Initialize `code` with `problem.starterCode` when problem loads
    - Implement `onRun`: call `runCode` with sample test cases, update `testResults`
    - Implement `onSubmit`: call `runCode` with hidden test cases, stop timer, call `generateDebrief`, switch view to `"debrief"`
    - Implement `onGetHint`: call `generateHint`, append result to `hints`
    - Implement `onCodeChange`: update `code` state
    - Start timer on mount when problem loads
    - Render split-pane layout: ProblemDisplay + CodeEditor side by side, ActionBar, Timer, TestResults, HintDisplay
    - Conditionally render DebriefPanel when `view === "debrief"`
    - _Requirements: 1.1, 1.4, 1.5, 3.1, 4.1, 4.3, 6.2, 7.1, 7.3, 9.1, 9.2, 9.4_

  - [x] 10.2 Update `src/main.jsx` and `src/index.css`
    - Ensure `main.jsx` renders `<App />` into the root DOM element
    - Ensure `index.css` imports Tailwind CSS
    - _Requirements: 9.1_

- [x] 11. Checkpoint — Verify full application
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Write integration tests
  - [x] 12.1 Write integration test for the Run flow
    - Load problem → write code → trigger Run → verify test results display
    - _Requirements: 1.1, 3.1, 3.2_

  - [x] 12.2 Write integration test for the Submit and Debrief flow
    - Load problem → write code → trigger Submit → verify debrief panel displays with all sections
    - _Requirements: 4.1, 4.2, 4.3, 8.1, 8.2, 8.3, 8.7_

  - [x] 12.3 Write integration test for the Hint flow
    - Load problem → write partial code → trigger Get Hint → verify hint displays
    - _Requirements: 6.2, 6.3, 6.5_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The runner system is built first since services and UI depend on it
