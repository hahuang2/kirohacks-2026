import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DebriefPanel from '../../components/DebriefPanel';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, language }) => (
    <pre data-testid="monaco-editor" data-language={language}>{value}</pre>
  ),
}));

const baseDebrief = {
  correctness: { passed: 4, total: 5, percentage: 80 },
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  codeFeedback: [
    'Good use of hash map for O(n) lookup',
    'Consider adding comments to explain your approach',
  ],
  missedEdgeCases: ['empty array', 'single element'],
  alternativeApproaches: [
    {
      name: 'Brute Force',
      description: 'Check every pair of numbers.',
      timeComplexity: 'O(n^2)',
      spaceComplexity: 'O(1)',
    },
  ],
  readinessScore: 72,
  elapsedTime: 305,
};

describe('DebriefPanel', () => {
  it('has an accessible section label', () => {
    render(<DebriefPanel debrief={baseDebrief} onBack={() => {}} />);
    expect(
      screen.getByRole('region', { name: /debrief panel/i })
    ).toBeInTheDocument();
  });

  it('renders the "Debrief" heading', () => {
    render(<DebriefPanel debrief={baseDebrief} onBack={() => {}} />);
    expect(screen.getByText('Debrief')).toBeInTheDocument();
  });

  // Correctness summary (Req 8.1)
  it('renders correctness summary with passed and total', () => {
    render(<DebriefPanel debrief={baseDebrief} onBack={() => {}} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/\/\s*5 test cases passed/)).toBeInTheDocument();
    expect(screen.getByText('(80%)')).toBeInTheDocument();
  });

  // Time complexity (Req 8.2)
  it('renders time complexity', () => {
    const debrief = { ...baseDebrief, timeComplexity: 'O(n^2)', spaceComplexity: 'O(1)' };
    render(<DebriefPanel debrief={debrief} onBack={() => {}} />);
    expect(screen.getByText('Time Complexity')).toBeInTheDocument();
    expect(screen.getByText('O(n^2)')).toBeInTheDocument();
  });

  // Space complexity (Req 8.3)
  it('renders space complexity', () => {
    const debrief = { ...baseDebrief, timeComplexity: 'O(n^2)', spaceComplexity: 'O(1)' };
    render(<DebriefPanel debrief={debrief} onBack={() => {}} />);
    expect(screen.getByText('Space Complexity')).toBeInTheDocument();
    expect(screen.getByText('O(1)')).toBeInTheDocument();
  });

  // Code feedback (Req 8.4)
  it('renders code feedback items', () => {
    render(<DebriefPanel debrief={baseDebrief} onBack={() => {}} />);
    expect(screen.getByText('Code Feedback')).toBeInTheDocument();
    expect(
      screen.getByText(/Good use of hash map/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Consider adding comments/)
    ).toBeInTheDocument();
  });

  it('does not render code feedback section when empty', () => {
    const debrief = { ...baseDebrief, codeFeedback: [] };
    render(<DebriefPanel debrief={debrief} onBack={() => {}} />);
    expect(screen.queryByText('Code Feedback')).not.toBeInTheDocument();
  });

  // Missed edge cases (Req 8.5)
  it('renders missed edge cases', () => {
    render(<DebriefPanel debrief={baseDebrief} onBack={() => {}} />);
    expect(screen.getByText('Missed Edge Cases')).toBeInTheDocument();
    expect(screen.getByText(/empty array/)).toBeInTheDocument();
    expect(screen.getByText(/single element/)).toBeInTheDocument();
  });

  it('does not render missed edge cases section when empty', () => {
    const debrief = { ...baseDebrief, missedEdgeCases: [] };
    render(<DebriefPanel debrief={debrief} onBack={() => {}} />);
    expect(screen.queryByText('Missed Edge Cases')).not.toBeInTheDocument();
  });

  // Alternative approaches (Req 8.6)
  it('renders alternative approaches with name, description, and complexities', () => {
    render(<DebriefPanel debrief={baseDebrief} onBack={() => {}} />);
    expect(screen.getByText('Alternative Approaches')).toBeInTheDocument();
    expect(screen.getByText('Brute Force')).toBeInTheDocument();
    expect(screen.getByText('Check every pair of numbers.')).toBeInTheDocument();
    expect(screen.getByText(/O\(n\^2\)/)).toBeInTheDocument();
    expect(screen.getByText(/O\(1\)/)).toBeInTheDocument();
  });

  it('does not render alternative approaches section when empty', () => {
    const debrief = { ...baseDebrief, alternativeApproaches: [] };
    render(<DebriefPanel debrief={debrief} onBack={() => {}} />);
    expect(screen.queryByText('Alternative Approaches')).not.toBeInTheDocument();
  });

  // Readiness score (Req 8.7)
  it('renders readiness score', () => {
    render(<DebriefPanel debrief={baseDebrief} onBack={() => {}} />);
    expect(screen.getByText('Interview Readiness Score')).toBeInTheDocument();
    expect(screen.getByTestId('readiness-score')).toHaveTextContent('72');
  });

  // Elapsed time (Req 8.8)
  it('renders elapsed time formatted as MM:SS', () => {
    render(<DebriefPanel debrief={baseDebrief} onBack={() => {}} />);
    expect(screen.getByText('Elapsed Time')).toBeInTheDocument();
    // 305 seconds = 05:05
    expect(screen.getByText('05:05')).toBeInTheDocument();
  });

  // Back button (Req 9.4)
  it('renders a Back button', () => {
    render(<DebriefPanel debrief={baseDebrief} onBack={() => {}} />);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('calls onBack when Back button is clicked', () => {
    const onBack = vi.fn();
    render(<DebriefPanel debrief={baseDebrief} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  // Multiple alternative approaches
  it('renders multiple alternative approaches', () => {
    const debrief = {
      ...baseDebrief,
      alternativeApproaches: [
        {
          name: 'Brute Force',
          description: 'Check every pair.',
          timeComplexity: 'O(n^2)',
          spaceComplexity: 'O(1)',
        },
        {
          name: 'Sorting',
          description: 'Sort then use two pointers.',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(1)',
        },
      ],
    };
    render(<DebriefPanel debrief={debrief} onBack={() => {}} />);
    expect(screen.getByText('Brute Force')).toBeInTheDocument();
    expect(screen.getByText('Sorting')).toBeInTheDocument();
  });

  // Zero readiness score
  it('renders a readiness score of 0', () => {
    const debrief = { ...baseDebrief, readinessScore: 0 };
    render(<DebriefPanel debrief={debrief} onBack={() => {}} />);
    expect(screen.getByTestId('readiness-score')).toHaveTextContent('0');
  });

  // All tests passed
  it('renders 100% correctness when all tests pass', () => {
    const debrief = {
      ...baseDebrief,
      correctness: { passed: 5, total: 5, percentage: 100 },
    };
    render(<DebriefPanel debrief={debrief} onBack={() => {}} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('(100%)')).toBeInTheDocument();
  });

  // Approach cards with code solutions (Req 1.1, 1.3)
  it('renders approach cards with code solutions when codeSolutions are present', () => {
    const debrief = {
      ...baseDebrief,
      alternativeApproaches: [
        {
          name: 'Hash Map',
          description: 'Use a hash map.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          codeSolutions: {
            javascript: 'function solve() {}',
            python: 'def solve(): pass',
          },
        },
      ],
    };
    render(<DebriefPanel debrief={debrief} onBack={() => {}} />);
    expect(screen.getByText('Hash Map')).toBeInTheDocument();
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });
});
