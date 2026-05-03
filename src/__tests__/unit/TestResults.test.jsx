import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TestResults from '../../components/TestResults';

describe('TestResults', () => {
  const passingResult = {
    testCaseId: 'test-1',
    passed: true,
    expected: [0, 1],
    actual: [0, 1],
  };

  const failingResult = {
    testCaseId: 'test-2',
    passed: false,
    expected: [1, 2],
    actual: [0, 3],
  };

  const errorResult = {
    testCaseId: 'test-3',
    passed: false,
    expected: [0, 1],
    actual: undefined,
    error: 'ReferenceError: x is not defined',
  };

  const timedOutResult = {
    testCaseId: 'test-4',
    passed: false,
    expected: [0, 1],
    actual: undefined,
    timedOut: true,
  };

  it('renders nothing when results is empty', () => {
    const { container } = render(<TestResults results={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when results is null', () => {
    const { container } = render(<TestResults results={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the "Test Results" heading', () => {
    render(<TestResults results={[passingResult]} />);
    expect(screen.getByText('Test Results')).toBeInTheDocument();
  });

  it('has an accessible section label', () => {
    render(<TestResults results={[passingResult]} />);
    expect(screen.getByRole('region', { name: /test results/i })).toBeInTheDocument();
  });

  it('renders a passing result with pass indicator', () => {
    render(<TestResults results={[passingResult]} />);
    expect(screen.getByText('test-1')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });

  it('renders a failing result with fail indicator', () => {
    render(<TestResults results={[failingResult]} />);
    expect(screen.getByText('test-2')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('displays expected and actual output for each result', () => {
    render(<TestResults results={[failingResult]} />);
    expect(screen.getByText('Expected:')).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify([1, 2]))).toBeInTheDocument();
    expect(screen.getByText('Actual:')).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify([0, 3]))).toBeInTheDocument();
  });

  it('displays error message when present', () => {
    render(<TestResults results={[errorResult]} />);
    expect(screen.getByText(/ReferenceError: x is not defined/)).toBeInTheDocument();
  });

  it('displays timeout indicator when timedOut is true', () => {
    render(<TestResults results={[timedOutResult]} />);
    expect(screen.getByText(/Execution exceeded the time limit/)).toBeInTheDocument();
  });

  it('does not display error message when not present', () => {
    render(<TestResults results={[passingResult]} />);
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
  });

  it('renders multiple results', () => {
    render(<TestResults results={[passingResult, failingResult, errorResult]} />);
    expect(screen.getByText('test-1')).toBeInTheDocument();
    expect(screen.getByText('test-2')).toBeInTheDocument();
    expect(screen.getByText('test-3')).toBeInTheDocument();
  });

  it('renders expected and actual as JSON for object values', () => {
    const result = {
      testCaseId: 'test-obj',
      passed: false,
      expected: { a: 1 },
      actual: { b: 2 },
    };
    render(<TestResults results={[result]} />);
    expect(screen.getByText(JSON.stringify({ a: 1 }))).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify({ b: 2 }))).toBeInTheDocument();
  });
});
