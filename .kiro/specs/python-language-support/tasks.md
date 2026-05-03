# Implementation Plan: Python Language Support

## Overview

Add Python as a second (and default) coding language to AlgoMentor. Python runs in-browser via Pyodide (WebAssembly) in a Web Worker. All five problems get Python starter code, the runner dispatcher gains a Python branch, the debrief service becomes language-aware, and a LanguageSelector component lets users switch between Python and JavaScript.

## Tasks

- [x] 1. Add Python starter code to problem data
  - [x] 1.1 Add `starterCodePython` field to all five problems in `src/data/problems.json`
    - Two Sum: `def two_sum(nums, target):`
    - Valid Parentheses: `def is_valid(s):`
    - Container With Most Water: `def max_area(height):`
    - Longest Substring: `def length_of_longest_substring(s):`
    - Merge Intervals: `def merge(intervals):`
    - Each Python starter code must define a function with snake_case name and a `# Write your solution here` comment
    - Preserve all existing `starterCode` (JavaScript) fields unchanged
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 1.2 Write unit tests for problem data validation
    - Verify all 5 problems have a `starterCodePython` field that is a non-empty string
    - Verify each Python starter code contains a `def` statement with a snake_case function name
    - Verify existing JavaScript `starterCode` fields are unchanged
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 2. Create the Pyodide execution Web Worker
  - [x] 2.1 Create `src/runners/pythonExecutionWorker.js`
    - Import `loadPyodide` from the jsDelivr CDN (`https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs`)
    - On startup, call `loadPyodide()` and store the instance; post an `{ type: "init", success: true }` message on success or `{ type: "init", success: false, error }` on failure
    - Listen for messages `{ code, fnName, input, id }`
    - Execute user code via `pyodide.runPythonAsync(code)`, then call the user function with test inputs, convert result to JS via `.toJs()`, and post back `{ actual, error, id }`
    - Catch `PythonError` for syntax/runtime errors and post back `{ error: error.message, id }`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.1, 9.2, 9.3_

- [x] 3. Create the Python runner module
  - [x] 3.1 Create `src/runners/pythonRunner.js` with `runPython`, `isPyodideReady`, and `getPyodideLoadError` exports
    - Manage a singleton Web Worker (`pythonExecutionWorker.js`) created on module import
    - Track Pyodide initialization status via the worker's `init` message
    - `runPython({ code, testCases, timeoutMs = 10000 })` — extract function name via regex from `def fn_name(`, send each test case to the worker, enforce per-test-case timeout via `Promise.race`
    - On timeout, terminate the worker and create a new one; return `{ timedOut: true, error: "Execution timed out after Xms" }`
    - If Pyodide is not ready, return error results for all test cases: `"Python runtime is not available: <reason>"`
    - If no `def` statement found, return error: `"Could not find a named function in the provided code."`
    - Return results in the same format as `runJavaScript`: `{ testCaseId, passed, expected, actual, error?, timedOut? }`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.1, 9.2, 9.3_

  - [x] 3.2 Write property test for Python function name extraction
    - **Property 4: Python function name extraction**
    - For any valid Python function definition of the form `def <name>(`, the extraction regex should correctly parse the function name
    - Add to `src/__tests__/properties/language.property.test.js`
    - **Validates: Requirements 4.2**

- [x] 4. Update the runner dispatcher to support Python
  - [x] 4.1 Modify `src/runners/index.js` to import `runPython` and add a `language === 'python'` branch
    - Import `{ runPython }` from `./pythonRunner.js`
    - Add: `if (language === 'python') return runPython({ code, testCases });`
    - Keep existing JavaScript branch and unsupported language error
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 4.2 Write property test for runner dispatcher routing
    - **Property 2: Runner dispatcher routes to correct runner**
    - For any language in `{"python", "javascript"}`, `runCode` delegates to the correct runner
    - Add to `src/__tests__/properties/runner.property.test.js`
    - **Validates: Requirements 2.5, 5.1, 5.2**

  - [x] 4.3 Write property test for unsupported language error
    - **Property 3: Unsupported language throws error**
    - For any string not in `{"python", "javascript"}`, `runCode` throws an error
    - Add to `src/__tests__/properties/runner.property.test.js`
    - **Validates: Requirements 5.3**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update the debrief service for Python language awareness
  - [x] 6.1 Modify `src/services/debrief.js` to accept a `language` parameter and add Python-specific analysis
    - Add `language` parameter to `generateDebrief` (default: `"javascript"` for backward compatibility)
    - Pass `language` to `analyzeTimeComplexity`, `analyzeSpaceComplexity`, `generateCodeFeedback`, and `detectNestedLoops`
    - In `analyzeTimeComplexity`: add Python loop patterns (`for\s+\w+\s+in`, `while\s+`, list comprehensions `\[.*\bfor\b.*\bin\b`)
    - In `analyzeSpaceComplexity`: add Python data structure patterns (`dict(`, `set(`, `{}` as dict, `[]` with `.append(`)
    - In `generateCodeFeedback`: add Python-specific feedback (dictionary usage, early return, `#` comments)
    - In `detectNestedLoops`: add Python indentation-based nesting detection for `for`/`while` without braces
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 6.2 Write property test for Python complexity analysis
    - **Property 5: Python complexity analysis detects correct patterns**
    - For any Python code string, time/space complexity analysis with `language="python"` should detect Python-specific patterns and return a valid Big-O notation string
    - Add to `src/__tests__/properties/debrief.property.test.js`
    - **Validates: Requirements 8.1, 8.2**

  - [x] 6.3 Write property test for debrief valid result for any language
    - **Property 6: Debrief produces valid result for any language**
    - For any code string and any supported language, `generateDebrief` returns a valid debrief object with all required fields without throwing
    - Add to `src/__tests__/properties/debrief.property.test.js`
    - **Validates: Requirements 8.4**

  - [x] 6.4 Write unit tests for debrief Python patterns
    - Test specific Python code examples with known complexity (nested for loops → O(n²), dict usage → O(n) space, list comprehension detection)
    - Test that JavaScript analysis is unchanged (backward compatibility)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Create the LanguageSelector component
  - [x] 7.1 Create `src/components/LanguageSelector.jsx`
    - Props: `language` ("python" | "javascript"), `onChange` callback
    - Render two selectable options: Python and JavaScript
    - Visually indicate the currently active language (e.g., highlighted button/tab)
    - Call `onChange` with the new language string when the user picks a different option
    - Ensure accessibility: proper ARIA labels, keyboard navigable
    - _Requirements: 1.1, 2.1, 2.4_

  - [x] 7.2 Write unit tests for LanguageSelector component
    - Renders both Python and JavaScript options
    - Highlights the active language
    - Calls `onChange` with the correct language when the other option is clicked
    - _Requirements: 1.1, 2.1, 2.4_

- [x] 8. Update CodeEditor to support dynamic language mode
  - [x] 8.1 Modify `src/components/CodeEditor.jsx` to accept a `language` prop
    - Add `language` prop ("python" | "javascript")
    - Replace `defaultLanguage="javascript"` with dynamic `language` prop on the Monaco `<Editor>` component
    - Monaco language mode switches between `"python"` and `"javascript"` based on the prop
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 8.2 Write unit tests for CodeEditor language prop
    - Verify Monaco receives `"python"` language when language prop is `"python"`
    - Verify Monaco receives `"javascript"` language when language prop is `"javascript"`
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 9. Wire language state into App.jsx
  - [x] 9.1 Add language state and integrate all components in `src/App.jsx`
    - Add `language` state initialized to `"python"` (default)
    - Create `onLanguageChange` callback: updates `language` state, swaps editor content to the starter code for the new language (`starterCodePython` for Python, `starterCode` for JavaScript)
    - Modify `onSelectProblem`: read starter code based on current `language` state (`starterCodePython` when Python, `starterCode` when JavaScript)
    - Modify `onRun` and `onSubmit`: pass current `language` to `runCode()`
    - Modify `onSubmit`: pass `language` to `generateDebrief()`
    - Render `<LanguageSelector>` in the coding view header, passing `language` and `onLanguageChange`
    - Pass `language` prop to `<CodeEditor>`
    - _Requirements: 1.1, 1.2, 1.3, 2.2, 2.3, 2.5, 7.1, 7.2, 7.3, 7.4_

  - [x] 9.2 Write property test for starter code selection by language
    - **Property 1: Starter code selection by language**
    - For any problem with both `starterCode` and `starterCodePython`, selecting a language returns the correct starter code
    - Add to `src/__tests__/properties/language.property.test.js`
    - **Validates: Requirements 1.2, 1.3, 2.2**

  - [x] 9.3 Write unit tests for App language integration
    - Verify language defaults to "python"
    - Verify selecting a problem loads Python starter code by default
    - Verify switching language swaps starter code in the editor
    - Verify Run passes the current language to `runCode`
    - Verify Submit passes the current language to `generateDebrief`
    - _Requirements: 1.1, 1.2, 1.3, 2.2, 2.5_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Pyodide is loaded from jsDelivr CDN — no npm dependency needed
- The Python runner uses a higher default timeout (10s) than JavaScript (5s) to account for Pyodide overhead
- The debrief service defaults to JavaScript analysis when no language is specified, preserving backward compatibility
