# Requirements Document

## Introduction

AlgoMentor is an MVP web application that simulates a mock technical interview experience. It presents users with LeetCode-style coding problems, provides a browser-based code editor for solving them, offers guided hints during the session, and delivers a comprehensive debrief after submission. The application is built with React, Vite, Tailwind CSS, and Monaco Editor, targeting JavaScript as the initial supported language with a runner architecture designed for future language expansion.

## Glossary

- **App**: The AlgoMentor web application running in the browser
- **Problem_Display**: The component responsible for rendering coding problem details including title, difficulty, description, examples, and constraints
- **Code_Editor**: The Monaco Editor-based component where users write their solution code
- **Test_Runner**: The module that executes user code against test cases and reports results
- **Runner_System**: The language-agnostic runner architecture located in `src/runners/` that dispatches code execution to language-specific runners
- **JavaScript_Runner**: The JavaScript-specific runner implementation at `src/runners/javascriptRunner.js`
- **Interview_Copilot**: The hint system that analyzes the current problem and user code to provide guidance without revealing the full solution
- **Timer**: The component that tracks elapsed time from when the user begins working on a problem
- **Debrief_Panel**: The panel displayed after submission that shows correctness, complexity analysis, code feedback, missed edge cases, alternative approaches, and an interview readiness score
- **Problem_Store**: The local JSON file containing coding problem definitions
- **Sample_Test_Cases**: Test cases visible to the user, used for the "Run" action
- **Hidden_Test_Cases**: Test cases not visible to the user, used for the "Submit" action
- **Starter_Code**: The pre-loaded code template provided in the editor when a problem is loaded
- **Hint**: A guided suggestion provided by the Interview_Copilot that helps the user progress without revealing the complete solution

## Requirements

### Requirement 1: Problem Loading and Display

**User Story:** As a user, I want to see a coding problem with its full details, so that I can understand what I need to solve during the mock interview.

#### Acceptance Criteria

1. WHEN the App is loaded, THE Problem_Display SHALL load problem data from the local Problem_Store JSON file.
2. THE Problem_Store SHALL contain at least one problem definition for "Two Sum" including title, difficulty level, description, examples, and constraints.
3. WHEN a problem is loaded, THE Problem_Display SHALL render the problem title, difficulty badge, description text, input/output examples, and constraints.
4. WHEN a problem is loaded, THE Code_Editor SHALL be pre-populated with the Starter_Code defined for that problem.
5. IF the Problem_Store fails to load, THEN THE App SHALL display an error message indicating that problems could not be loaded.

### Requirement 2: Code Editor

**User Story:** As a user, I want a full-featured code editor in the browser, so that I can write and edit my solution comfortably.

#### Acceptance Criteria

1. THE Code_Editor SHALL render a Monaco Editor instance configured for JavaScript syntax highlighting and autocompletion.
2. WHEN a problem is loaded, THE Code_Editor SHALL display the Starter_Code for that problem.
3. THE Code_Editor SHALL allow the user to type, edit, delete, and navigate code freely within the editor area.
4. THE Code_Editor SHALL provide the current editor content to the Test_Runner and Interview_Copilot when requested.

### Requirement 3: Test Runner — Run with Sample Test Cases

**User Story:** As a user, I want to run my code against sample test cases, so that I can verify my solution before submitting.

#### Acceptance Criteria

1. WHEN the user activates the "Run" action, THE Test_Runner SHALL execute the user code against all Sample_Test_Cases defined for the current problem.
2. WHEN execution completes, THE Test_Runner SHALL display each test case result showing pass or fail status, expected output, and actual output.
3. IF the user code throws a runtime error during execution, THEN THE Test_Runner SHALL display the error message for the failing test case.
4. IF the user code exceeds a 5-second execution time limit per test case, THEN THE Test_Runner SHALL terminate execution and display a timeout error for that test case.

### Requirement 4: Test Runner — Submit with Hidden Test Cases

**User Story:** As a user, I want to submit my solution against hidden test cases, so that I can see how my code performs on cases I haven't seen.

#### Acceptance Criteria

1. WHEN the user activates the "Submit" action, THE Test_Runner SHALL execute the user code against all Hidden_Test_Cases defined for the current problem.
2. WHEN submission execution completes, THE Test_Runner SHALL display each hidden test case result showing pass or fail status, expected output, and actual output.
3. WHEN submission execution completes successfully, THE App SHALL display the Debrief_Panel with the submission results.
4. IF the user code throws a runtime error during submission, THEN THE Test_Runner SHALL display the error message for the failing test case.
5. IF the user code exceeds a 5-second execution time limit per test case during submission, THEN THE Test_Runner SHALL terminate execution and display a timeout error for that test case.

### Requirement 5: Runner System Architecture

**User Story:** As a developer, I want a modular runner system, so that new programming languages can be added in the future without restructuring the codebase.

#### Acceptance Criteria

1. THE Runner_System SHALL expose a single entry point function `runCode({ language, code, testCases })` in `src/runners/index.js`.
2. WHEN `runCode` is called with `language` set to "javascript", THE Runner_System SHALL delegate execution to the JavaScript_Runner at `src/runners/javascriptRunner.js`.
3. IF `runCode` is called with an unsupported language value, THEN THE Runner_System SHALL return an error indicating the language is not supported.
4. THE JavaScript_Runner SHALL accept code and test cases, execute the code, and return results containing pass/fail status, expected output, and actual output for each test case.

### Requirement 6: Interview Copilot — Hint System

**User Story:** As a user, I want to get helpful hints while solving a problem, so that I can learn and make progress without having the full answer revealed.

#### Acceptance Criteria

1. THE App SHALL display a "Get Hint" button accessible to the user during the coding session.
2. WHEN the user activates the "Get Hint" button, THE Interview_Copilot SHALL analyze the current problem description and the user's current code from the Code_Editor.
3. WHEN the Interview_Copilot generates a hint, THE Interview_Copilot SHALL provide guidance that helps the user progress toward a solution.
4. THE Interview_Copilot SHALL NOT include complete solution code in any generated hint.
5. WHEN a hint is generated, THE App SHALL display the hint text to the user in a visible hint display area.

### Requirement 7: Timer

**User Story:** As a user, I want to see how much time I've spent on a problem, so that I can practice time management for real interviews.

#### Acceptance Criteria

1. WHEN the user begins a coding session, THE Timer SHALL start tracking elapsed time from zero.
2. WHILE the coding session is active, THE Timer SHALL display the current elapsed time in minutes and seconds, updated every second.
3. WHEN the user submits their solution, THE Timer SHALL stop tracking elapsed time.
4. THE Timer SHALL display the final elapsed time on the Debrief_Panel after submission.

### Requirement 8: Debrief Panel

**User Story:** As a user, I want a detailed debrief after submitting my solution, so that I can understand my strengths and areas for improvement.

#### Acceptance Criteria

1. WHEN the user submits their solution, THE Debrief_Panel SHALL display a correctness summary showing the number of test cases passed out of total test cases.
2. WHEN the user submits their solution, THE Debrief_Panel SHALL display an analysis of the solution's time complexity using Big-O notation.
3. WHEN the user submits their solution, THE Debrief_Panel SHALL display an analysis of the solution's space complexity using Big-O notation.
4. WHEN the user submits their solution, THE Debrief_Panel SHALL display code quality feedback identifying strengths and areas for improvement.
5. WHEN the user submits their solution, THE Debrief_Panel SHALL display a list of missed edge cases relevant to the problem, if any.
6. WHEN the user submits their solution, THE Debrief_Panel SHALL display at least one alternative approach to solving the problem.
7. WHEN the user submits their solution, THE Debrief_Panel SHALL display an interview readiness score.
8. THE Debrief_Panel SHALL display the total elapsed time from the Timer.

### Requirement 9: Application Layout and Navigation

**User Story:** As a user, I want a clean and intuitive layout, so that I can focus on solving the problem without distraction.

#### Acceptance Criteria

1. THE App SHALL display the Problem_Display and Code_Editor side by side in a split-pane layout.
2. THE App SHALL display the Timer in a persistently visible location during the coding session.
3. THE App SHALL provide clearly labeled "Run", "Submit", and "Get Hint" action buttons.
4. WHEN the Debrief_Panel is displayed, THE App SHALL present the debrief content in a clearly separated view or overlay.
