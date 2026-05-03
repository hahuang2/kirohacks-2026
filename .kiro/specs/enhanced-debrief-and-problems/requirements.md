# Requirements Document

## Introduction

This feature enhances the AlgoMentor application in three areas: (1) the Debrief Panel's "Alternative Approaches" section is extended to show actual code implementations instead of text-only descriptions, (2) alternative approach code is provided in multiple programming languages for cross-language learning, and (3) the Problem Store is expanded from a single problem (Two Sum) to a broader set of LeetCode-style coding problems. Users still write and execute JavaScript solutions — the multi-language code in alternative approaches is for reference and learning only.

## Glossary

- **App**: The AlgoMentor web application running in the browser
- **Debrief_Panel**: The panel displayed after submission that shows correctness, complexity analysis, code feedback, missed edge cases, alternative approaches, and an interview readiness score
- **Alternative_Approach**: A section within the Debrief_Panel that describes a different algorithmic strategy for solving the current problem, now including code implementations
- **Code_Snippet**: A block of syntax-highlighted source code displayed within an Alternative_Approach card
- **Language_Selector**: A UI control within an Alternative_Approach card that allows the user to switch between programming language implementations
- **Problem_Store**: The local JSON file (`src/data/problems.json`) containing coding problem definitions
- **Supported_Languages**: The set of programming languages for which alternative approach code is provided: JavaScript, Python, and Java

## Requirements

### Requirement 1: Alternative Approach Code Solutions

**User Story:** As a user, I want to see actual code implementations for each alternative approach in the debrief, so that I can learn concrete solutions beyond my own.

#### Acceptance Criteria

1. WHEN the Debrief_Panel displays an Alternative_Approach, THE Debrief_Panel SHALL render a Code_Snippet showing the implementation for that approach.
2. THE Code_Snippet SHALL display syntax-highlighted source code appropriate to the selected programming language.
3. WHEN the Debrief_Panel displays an Alternative_Approach, THE Debrief_Panel SHALL continue to display the approach name, description, time complexity, and space complexity alongside the Code_Snippet.
4. IF an Alternative_Approach does not contain code solution data, THEN THE Debrief_Panel SHALL display the approach name, description, and complexity information without a Code_Snippet.

### Requirement 2: Multi-Language Code Examples

**User Story:** As a user, I want to see alternative approach code in different programming languages, so that I can learn how solutions translate across languages.

#### Acceptance Criteria

1. THE Problem_Store SHALL include code solutions for each Alternative_Approach in all Supported_Languages (JavaScript, Python, and Java).
2. WHEN the Debrief_Panel displays an Alternative_Approach with code solutions, THE Language_Selector SHALL default to JavaScript.
3. WHEN the user selects a different language from the Language_Selector, THE Debrief_Panel SHALL display the Code_Snippet for the selected language.
4. THE Language_Selector SHALL only display languages for which code solutions exist in the current Alternative_Approach.
5. WHILE the user switches between languages within an Alternative_Approach, THE Debrief_Panel SHALL preserve the approach name, description, and complexity information without change.

### Requirement 3: Extended Alternative Approach Data Model

**User Story:** As a developer, I want the AlternativeApproach data model to support code solutions in multiple languages, so that the debrief service and UI can render them correctly.

#### Acceptance Criteria

1. THE Alternative_Approach data model SHALL include a `codeSolutions` field that maps language names to code strings.
2. THE `codeSolutions` field SHALL use language names matching the Supported_Languages as keys (e.g., "javascript", "python", "java").
3. WHEN the debrief service generates Alternative_Approach data, THE debrief service SHALL pass through the `codeSolutions` field from the Problem_Store without modification.
4. IF the Problem_Store entry for an Alternative_Approach omits the `codeSolutions` field, THEN THE debrief service SHALL treat the approach as having no code solutions.

### Requirement 4: Expanded Problem Set

**User Story:** As a user, I want access to multiple coding problems of varying difficulty, so that I can practice a range of algorithmic concepts.

#### Acceptance Criteria

1. THE Problem_Store SHALL contain at least five distinct coding problems.
2. THE Problem_Store SHALL include problems at each difficulty level: Easy, Medium, and Hard.
3. WHEN the App is loaded, THE App SHALL allow the user to select a problem from the available problems in the Problem_Store.
4. WHEN the user selects a problem, THE App SHALL load the selected problem's details, starter code, test cases, hints, and debrief configuration.
5. THE Problem_Store SHALL include complete data for each problem: title, difficulty, description, examples, constraints, starter code, sample test cases, hidden test cases, hints configuration, and debrief configuration including alternative approaches with code solutions.

### Requirement 5: Difficulty-Based Problem Selection

**User Story:** As a user, I want to choose a difficulty level and receive a problem at that level, so that I can practice at the right challenge tier without being overwhelmed by a full problem list.

#### Acceptance Criteria

1. THE App SHALL display a problem selection view presenting the three difficulty levels: Easy, Medium, and Hard.
2. WHEN the user selects a difficulty level, THE App SHALL load one problem from the Problem_Store that matches the selected difficulty.
3. WHEN multiple problems exist at the selected difficulty level, THE App SHALL select one at random.
4. WHEN a problem is selected, THE App SHALL transition to the coding view with the selected problem loaded.
5. WHILE the user is in the coding view, THE App SHALL provide a way to return to the problem selection view.
6. WHEN the user returns to the problem selection view, THE App SHALL reset the coding session state including code, test results, hints, timer, and debrief data.
