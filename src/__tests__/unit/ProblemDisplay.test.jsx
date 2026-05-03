import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProblemDisplay from '../../components/ProblemDisplay';

const sampleProblem = {
  id: 'two-sum',
  title: 'Two Sum',
  difficulty: 'Easy',
  description:
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
    },
  ],
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    'Only one valid answer exists.',
  ],
};

describe('ProblemDisplay', () => {
  it('renders the problem title', () => {
    render(<ProblemDisplay problem={sampleProblem} loadError={null} />);
    expect(screen.getByText('Two Sum')).toBeInTheDocument();
  });

  it('renders the difficulty badge', () => {
    render(<ProblemDisplay problem={sampleProblem} loadError={null} />);
    const badge = screen.getByText('Easy');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-100');
  });

  it('renders the description', () => {
    render(<ProblemDisplay problem={sampleProblem} loadError={null} />);
    expect(
      screen.getByText(/Given an array of integers nums/)
    ).toBeInTheDocument();
  });

  it('renders examples with input and output', () => {
    render(<ProblemDisplay problem={sampleProblem} loadError={null} />);
    expect(
      screen.getByText('nums = [2,7,11,15], target = 9')
    ).toBeInTheDocument();
    expect(screen.getByText('[0,1]')).toBeInTheDocument();
  });

  it('renders example explanation when provided', () => {
    render(<ProblemDisplay problem={sampleProblem} loadError={null} />);
    expect(
      screen.getByText(/Because nums\[0\] \+ nums\[1\] == 9/)
    ).toBeInTheDocument();
  });

  it('renders constraints', () => {
    render(<ProblemDisplay problem={sampleProblem} loadError={null} />);
    expect(
      screen.getByText('2 <= nums.length <= 10^4')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Only one valid answer exists.')
    ).toBeInTheDocument();
  });

  it('renders an error message when loadError is set and problem is null', () => {
    render(
      <ProblemDisplay problem={null} loadError="Could not load problems" />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText('Could not load problems')
    ).toBeInTheDocument();
  });

  it('renders loading state when problem and loadError are both null', () => {
    render(<ProblemDisplay problem={null} loadError={null} />);
    expect(screen.getByText(/Loading problem/)).toBeInTheDocument();
  });

  it('renders Medium difficulty with yellow badge', () => {
    const mediumProblem = { ...sampleProblem, difficulty: 'Medium' };
    render(<ProblemDisplay problem={mediumProblem} loadError={null} />);
    const badge = screen.getByText('Medium');
    expect(badge.className).toContain('bg-yellow-100');
  });

  it('renders Hard difficulty with red badge', () => {
    const hardProblem = { ...sampleProblem, difficulty: 'Hard' };
    render(<ProblemDisplay problem={hardProblem} loadError={null} />);
    const badge = screen.getByText('Hard');
    expect(badge.className).toContain('bg-red-100');
  });

  it('has an accessible section label', () => {
    render(<ProblemDisplay problem={sampleProblem} loadError={null} />);
    expect(
      screen.getByRole('region', { name: /problem display/i })
    ).toBeInTheDocument();
  });
});
