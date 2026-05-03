# Requirements Document

## Introduction

AlgoMentor currently supports only JavaScript for writing and running algorithm solutions. This feature adds Python as a second supported language and makes it the default. Python code execution runs in-browser using Pyodide (Python compiled to WebAssembly). Users can switch between Python and JavaScript via a language selector in the coding view. All five existing problems receive Python starter code, and the test evaluation pipeline works identically for both languages.

## Glossary

- **Language_Selector**: A UI control in the coding view that allows the user to choose between Python and JavaScript as the active coding language.
- **Python_Runner**: The module responsible for executing user-submitted Python code against test cases using Pyodide in the browser.
- **JavaScript_Runner**: The existing module responsible for executing user-submitted JavaScript code against test cases.
- **Pyodide**: An open-source project that compiles CPython to WebAssembly, enabling Python execution directly in the browser without a server.
- **Code_Editor**: The Monaco-based editor component that displays and accepts user code input.
- **Runner_Dispatcher**: The `runCode` function in `src/runners/index.js` that routes code execution to the appropriate language-specific runner.
- **Problem_Data**: The JSON data structure in `src/data/problems.json` that defines each problem's metadata, starter code, and test cases.
- **Debrief_Service**: The module in `src/services/debrief.js` that analyzes submitted code for complexity, feedback, and readiness scoring.
- **Starter_Code**: The initial code template shown in the editor when a user selects a problem, specific to the chosen language.

## Requirements

### Requirement 1: Default Language Selection

**User Story:** As a user, I want Python to be the default language when I start a problem, so that I can begin coding in Python without extra steps.

#### Acceptance Criteria

1. WHEN a user selects a problem, THE Language_Selector SHALL default to Python as the active language.
2. WHEN a user selects a problem with Python as the active language, THE Code_Editor SHALL display the Python Starter_Code for that problem.
3. WHEN a user selects a problem with JavaScript as the active language, THE Code_Editor SHALL display the JavaScript Starter_Code for that problem.

### Requirement 2: Language Switching

**User Story:** As a user, I want to switch between Python and JavaScript while solving a problem, so that I can use whichever language I prefer.

#### Acceptance Criteria

1. WHILE the coding view is active, THE Language_Selector SHALL display Python and JavaScript as the two available language options.
2. WHEN the user switches the language via the Language_Selector, THE Code_Editor SHALL replace the current content with the Starter_Code for the newly selected language.
3. WHEN the user switches the language via the Language_Selector, THE Code_Editor SHALL update its syntax highlighting mode to match the selected language.
4. WHEN the user switches the language via the Language_Selector, THE Language_Selector SHALL visually indicate the currently active language.
5. WHEN the user switches the language and then runs or submits code, THE Runner_Dispatcher SHALL use the currently selected language for execution.

### Requirement 3: Python Starter Code for All Problems

**User Story:** As a user, I want every problem to have Python starter code, so that I have a proper function template when solving problems in Python.

#### Acceptance Criteria

1. THE Problem_Data SHALL include a Python Starter_Code entry for each of the five existing problems (Two Sum, Valid Parentheses, Container With Most Water, Longest Substring Without Repeating Characters, Merge Intervals).
2. THE Python Starter_Code for each problem SHALL define a function with a snake_case name matching the problem's expected function signature.
3. THE Problem_Data SHALL retain the existing JavaScript Starter_Code for each problem alongside the new Python Starter_Code.

### Requirement 4: Python Code Execution via Pyodide

**User Story:** As a user, I want to run my Python solutions in the browser, so that I can test my code without needing a backend server.

#### Acceptance Criteria

1. WHEN the user runs Python code, THE Python_Runner SHALL execute the code using Pyodide (Python compiled to WebAssembly) in the browser.
2. WHEN the user runs Python code, THE Python_Runner SHALL invoke the user-defined function with the test case inputs and capture the return value.
3. WHEN Python code contains a syntax error, THE Python_Runner SHALL return a descriptive error message for the failing test case.
4. WHEN Python code raises a runtime exception, THE Python_Runner SHALL return the exception message as an error for the failing test case.
5. WHEN Python code execution exceeds a timeout threshold, THE Python_Runner SHALL terminate execution and return a timeout error for the affected test case.
6. THE Python_Runner SHALL produce test results in the same format as the JavaScript_Runner (testCaseId, passed, expected, actual, error, timedOut).

### Requirement 5: Runner Dispatcher Language Routing

**User Story:** As a developer, I want the runner dispatcher to route execution to the correct language runner, so that both Python and JavaScript code execute through the appropriate engine.

#### Acceptance Criteria

1. WHEN the Runner_Dispatcher receives a request with language set to "python", THE Runner_Dispatcher SHALL delegate execution to the Python_Runner.
2. WHEN the Runner_Dispatcher receives a request with language set to "javascript", THE Runner_Dispatcher SHALL delegate execution to the JavaScript_Runner.
3. IF the Runner_Dispatcher receives a request with an unsupported language, THEN THE Runner_Dispatcher SHALL throw an error indicating the language is not supported.

### Requirement 6: Monaco Editor Language Mode Switching

**User Story:** As a user, I want the code editor to provide proper syntax highlighting and language features for the selected language, so that I have a good editing experience.

#### Acceptance Criteria

1. WHEN Python is the active language, THE Code_Editor SHALL configure Monaco to use the "python" language mode.
2. WHEN JavaScript is the active language, THE Code_Editor SHALL configure Monaco to use the "javascript" language mode.
3. WHEN the language mode changes, THE Code_Editor SHALL update syntax highlighting immediately without requiring a page reload.

### Requirement 7: Test Case Evaluation for Both Languages

**User Story:** As a user, I want test results to work the same way regardless of which language I use, so that I get consistent feedback on my solutions.

#### Acceptance Criteria

1. WHEN the user clicks Run with Python selected, THE Runner_Dispatcher SHALL execute the Python code against the sample test cases and return results.
2. WHEN the user clicks Run with JavaScript selected, THE Runner_Dispatcher SHALL execute the JavaScript code against the sample test cases and return results.
3. WHEN the user clicks Submit with Python selected, THE Runner_Dispatcher SHALL execute the Python code against the hidden test cases and return results.
4. WHEN the user clicks Submit with JavaScript selected, THE Runner_Dispatcher SHALL execute the JavaScript code against the hidden test cases and return results.
5. THE Python_Runner SHALL compare actual output to expected output using deep equality, consistent with the JavaScript_Runner comparison logic.

### Requirement 8: Debrief Service Language Compatibility

**User Story:** As a user, I want the debrief analysis to work correctly for Python code, so that I receive meaningful feedback on my Python solutions.

#### Acceptance Criteria

1. WHEN the Debrief_Service analyzes Python code, THE Debrief_Service SHALL detect loop-based complexity patterns using Python syntax (for/while loops, list comprehensions).
2. WHEN the Debrief_Service analyzes Python code, THE Debrief_Service SHALL detect data structure usage patterns using Python syntax (dict, set, list).
3. WHEN the Debrief_Service generates code feedback for Python code, THE Debrief_Service SHALL evaluate Python-specific patterns (e.g., use of dictionary for lookup, early return, descriptive variable names).
4. THE Debrief_Service SHALL produce a valid debrief result for both Python and JavaScript code without errors.

### Requirement 9: Pyodide Loading and Initialization

**User Story:** As a user, I want Pyodide to load reliably so that Python execution is available when I need it.

#### Acceptance Criteria

1. WHEN the application loads and Python is the default language, THE Python_Runner SHALL initialize Pyodide before the user first runs code.
2. IF Pyodide fails to load, THEN THE Python_Runner SHALL return a descriptive error message indicating that the Python runtime could not be initialized.
3. WHILE Pyodide is loading, THE Python_Runner SHALL not block the main UI thread.
