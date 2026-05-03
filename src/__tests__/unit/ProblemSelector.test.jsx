import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import ProblemSelector, { selectProblemByDifficulty } from '../../components/ProblemSelector';

// Feature: enhanced-debrief-and-problems, Property 7: Difficulty-based selection always returns a matching problem

const problemArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
  title: fc.string({ minLength: 1, maxLength: 50 }),
});

describe('ProblemSelector - Property Tests', () => {
  // **Validates: Requirements 5.2, 5.3**
  it('Property 7: Difficulty-based selection always returns a matching problem', () => {
    fc.assert(
      fc.property(
        fc.array(problemArb, { minLength: 1, maxLength: 30 }),
        fc.constantFrom('Easy', 'Medium', 'Hard'),
        (problems, difficulty) => {
          const hasMatchingProblem = problems.some((p) => p.difficulty === difficulty);
          if (!hasMatchingProblem) return true; // skip difficulties with no problems

          const result = selectProblemByDifficulty(problems, difficulty);

          // The returned problem's difficulty must equal the selected difficulty
          expect(result).not.toBeNull();
          expect(result.difficulty).toBe(difficulty);

          // The returned problem must be one of the problems in the input array
          const found = problems.some(
            (p) => p.id === result.id && p.difficulty === result.difficulty && p.title === result.title
          );
          expect(found).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});


const testProblems = [
  { id: 'p1', title: 'Problem 1', difficulty: 'Easy' },
  { id: 'p2', title: 'Problem 2', difficulty: 'Easy' },
  { id: 'p3', title: 'Problem 3', difficulty: 'Medium' },
  { id: 'p4', title: 'Problem 4', difficulty: 'Medium' },
  { id: 'p5', title: 'Problem 5', difficulty: 'Medium' },
];

describe('ProblemSelector unit tests', () => {
  // _Requirements: 5.1_
  it('renders three difficulty buttons (Easy, Medium, Hard)', () => {
    render(<ProblemSelector problems={testProblems} onSelectProblem={() => {}} />);

    expect(screen.getByTestId('difficulty-Easy')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-Medium')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-Hard')).toBeInTheDocument();
  });

  // _Requirements: 5.4_
  it('clicking a difficulty calls onSelectProblem with a matching problem', () => {
    const onSelectProblem = vi.fn();
    render(<ProblemSelector problems={testProblems} onSelectProblem={onSelectProblem} />);

    fireEvent.click(screen.getByTestId('difficulty-Easy'));

    expect(onSelectProblem).toHaveBeenCalledTimes(1);
    const selectedProblem = onSelectProblem.mock.calls[0][0];
    expect(selectedProblem.difficulty).toBe('Easy');
  });

  // _Requirements: 5.1_
  it('disables the button when no problems exist at that difficulty level', () => {
    render(<ProblemSelector problems={testProblems} onSelectProblem={() => {}} />);

    // testProblems has no Hard problems
    expect(screen.getByTestId('difficulty-Hard')).toBeDisabled();
    // Easy and Medium should be enabled
    expect(screen.getByTestId('difficulty-Easy')).not.toBeDisabled();
    expect(screen.getByTestId('difficulty-Medium')).not.toBeDisabled();
  });

  // _Requirements: 5.1_
  it('displays the correct problem count per difficulty', () => {
    render(<ProblemSelector problems={testProblems} onSelectProblem={() => {}} />);

    // 2 Easy problems
    expect(screen.getByTestId('difficulty-Easy')).toHaveTextContent('2 problems');
    // 3 Medium problems
    expect(screen.getByTestId('difficulty-Medium')).toHaveTextContent('3 problems');
  });
});
