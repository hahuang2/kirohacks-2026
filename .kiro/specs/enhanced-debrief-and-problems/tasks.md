# Implementation Plan: Enhanced Debrief and Problems

## Overview

This plan implements three enhancements to AlgoMentor: (1) code solutions in debrief alternative approaches with multi-language support, (2) an expanded problem set with 5 problems, and (3) a difficulty-based problem selection view. Tasks are ordered so each builds on the previous, starting with data changes, then new components, then wiring into the app.

## Tasks

- [x] 1. Expand problems.json with codeSolutions and new problems
  - [x] 1.1 Add `codeSolutions` to the existing Two Sum problem's alternative approaches
    - Add `codeSolutions` (with `"javascript"`, `"python"`, `"java"` keys) to each of the three existing alternative approaches (Brute Force, Hash Map, Sorting with Two Pointers)
    - Each code solution must be a non-empty string with a valid implementation in that language
    - _Requirements: 2.1, 3.1, 3.2_
  - [x] 1.2 Add Valid Parentheses problem (Easy)
    - Add a complete problem entry with id, title, difficulty "Easy", description, examples, constraints, starterCode, sampleTestCases, hiddenTestCases, hints, and debrief config
    - Include at least 2 alternative approaches, each with `codeSolutions` in all three Supported_Languages
    - _Requirements: 4.1, 4.2, 4.5, 2.1_
  - [x] 1.3 Add Container With Most Water problem (Medium)
    - Add a complete problem entry with difficulty "Medium"
    - Include at least 2 alternative approaches with `codeSolutions` in all three Supported_Languages
    - _Requirements: 4.1, 4.2, 4.5, 2.1_
  - [x] 1.4 Add Longest Substring Without Repeating Characters problem (Medium)
    - Add a complete problem entry with difficulty "Medium"
    - Include at least 2 alternative approaches with `codeSolutions` in all three Supported_Languages
    - _Requirements: 4.1, 4.2, 4.5, 2.1_
  - [x] 1.5 Add Merge Intervals problem (Medium)
    - Add a complete problem entry with difficulty "Medium"
    - Include at least 2 alternative approaches with `codeSolutions` in all three Supported_Languages
    - _Requirements: 4.1, 4.2, 4.5, 2.1_
  - [x] 1.6 Write property tests for problem data completeness
    - **Property 5: All problem approaches include all supported languages**
    - **Property 6: Every problem in the store has complete data**
    - Add to `src/__tests__/unit/problems.test.js`
    - Load `problems.json`, iterate all problems and approaches, verify `codeSolutions` has `"javascript"`, `"python"`, `"java"` keys with non-empty strings
    - Verify every problem has all required fields non-empty
    - **Validates: Requirements 2.1, 3.2, 4.5**

- [x] 2. Checkpoint — Verify problem data
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create the ApproachCard component
  - [x] 3.1 Create `src/components/ApproachCard.jsx`
    - Render approach name, description, timeComplexity, spaceComplexity always
    - If `codeSolutions` exists and is non-empty, render language selector tabs and a read-only Monaco Editor
    - Language selector defaults to `"javascript"` if present, otherwise first available key
    - Only show tabs for languages present in `codeSolutions`
    - Monaco config: readOnly, minimap disabled, lineNumbers on, scrollBeyondLastLine false, automaticLayout true, fontSize 13, domReadOnly true
    - Height auto-sized based on line count (min/max bounds)
    - If `codeSolutions` is missing or empty, render only text metadata (no editor, no tabs)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.3, 2.4, 2.5_
  - [x] 3.2 Write property tests for ApproachCard
    - **Property 1: Approach metadata is always present regardless of language selection**
    - **Property 2: Language switching displays the correct code**
    - **Property 3: Language selector shows exactly the available languages**
    - Add to `src/__tests__/unit/ApproachCard.test.jsx`
    - Use fast-check to generate random approach objects with varying `codeSolutions` maps
    - **Validates: Requirements 1.3, 2.3, 2.4, 2.5**
  - [x] 3.3 Write unit tests for ApproachCard
    - Test rendering with codeSolutions (verify code snippet and language tabs appear)
    - Test rendering without codeSolutions (verify no editor rendered)
    - Test default language is JavaScript when present
    - Add to `src/__tests__/unit/ApproachCard.test.jsx`
    - _Requirements: 1.1, 1.4, 2.2_

- [x] 4. Update DebriefPanel to use ApproachCard
  - [x] 4.1 Modify `src/components/DebriefPanel.jsx`
    - Import ApproachCard
    - Replace the inline alternative approach rendering with `<ApproachCard approach={approach} />` for each approach
    - Keep all other debrief sections unchanged
    - _Requirements: 1.1, 1.3_
  - [x] 4.2 Write property test for debrief codeSolutions passthrough
    - **Property 4: Debrief service passes through codeSolutions without modification**
    - Add to `src/__tests__/properties/debrief.property.test.js`
    - Use fast-check to generate random problem objects with `codeSolutions`, call `generateDebrief`, verify output preserves `codeSolutions` identically
    - **Validates: Requirements 3.3, 3.4**
  - [x] 4.3 Update DebriefPanel unit tests
    - Update `src/__tests__/unit/DebriefPanel.test.jsx` to account for ApproachCard usage
    - Verify approach cards render within the debrief panel
    - _Requirements: 1.1, 1.3_

- [x] 5. Checkpoint — Verify ApproachCard and DebriefPanel
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create the ProblemSelector component
  - [x] 6.1 Create `src/components/ProblemSelector.jsx`
    - Accept `problems` array and `onSelectProblem` callback as props
    - Display three difficulty-level cards: Easy, Medium, Hard
    - Show the count of available problems per difficulty level
    - On click, filter problems to selected difficulty, pick one at random, call `onSelectProblem`
    - Disable a difficulty button if no problems exist at that level
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 6.2 Write property test for difficulty selection
    - **Property 7: Difficulty-based selection always returns a matching problem**
    - Add to `src/__tests__/unit/ProblemSelector.test.jsx`
    - Use fast-check to generate random arrays of problems with various difficulties, simulate selection, verify returned problem's difficulty matches
    - **Validates: Requirements 5.2, 5.3**
  - [x] 6.3 Write unit tests for ProblemSelector
    - Test rendering shows three difficulty buttons
    - Test clicking a difficulty calls `onSelectProblem` with a matching problem
    - Add to `src/__tests__/unit/ProblemSelector.test.jsx`
    - _Requirements: 5.1, 5.4_

- [x] 7. Update App.jsx with selection view and state management
  - [x] 7.1 Modify `src/App.jsx` to add selection view and problem management
    - Load all problems into a `problems` state array on mount
    - Change initial `view` state to `"selection"` (was `"coding"`)
    - Add `onSelectProblem(problem)` callback: sets selected problem, resets session state (code to starterCode, testResults to [], hints to [], elapsedTime to 0, debriefData to null), transitions to coding view, starts timer
    - Add `onChangeProblem()` callback: resets all session state, transitions to selection view
    - Render `ProblemSelector` when `view === "selection"`
    - Add "Change Problem" button in the coding view header and debrief view that calls `onChangeProblem`
    - Timer starts when transitioning to coding view, not on mount
    - _Requirements: 4.3, 4.4, 5.4, 5.5, 5.6_
  - [x] 7.2 Write property test for session state reset
    - **Property 8: Returning to selection resets all session state**
    - Add to `src/__tests__/unit/App.test.jsx`
    - Use fast-check to generate random session states, trigger reset via `onChangeProblem`, verify all fields return to initial values
    - **Validates: Requirements 5.6**
  - [x] 7.3 Write unit tests for App selection flow
    - Test that App renders selection view on initial load
    - Test that coding view has a "Change Problem" control
    - Add to `src/__tests__/unit/App.test.jsx`
    - _Requirements: 4.3, 5.5_

- [x] 8. Checkpoint — Verify full feature
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Integration tests
  - [x] 9.1 Write integration test for selection → coding flow
    - Render App → select difficulty → verify coding view loads with correct problem
    - Add to `src/__tests__/integration/selectionFlow.test.jsx`
    - _Requirements: 4.3, 4.4, 5.4_
  - [x] 9.2 Write integration test for full cycle (selection → coding → debrief → selection)
    - Complete a full cycle and verify state resets correctly
    - Add to `src/__tests__/integration/selectionFlow.test.jsx`
    - _Requirements: 5.5, 5.6_
  - [x] 9.3 Write integration test for language switching in debrief
    - Submit solution → view debrief → switch languages in approach card → verify code changes
    - Add to `src/__tests__/integration/selectionFlow.test.jsx`
    - _Requirements: 2.3_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `debrief.js` service does not need modification — `getAlternativeApproaches` already passes through `codeSolutions` from the problem data
- Monaco Editor (`@monaco-editor/react`) is already installed — no new dependencies needed
- fast-check is already installed for property-based testing
