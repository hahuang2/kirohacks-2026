import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

// Mock @monaco-editor/react — Monaco requires a real browser environment.
// Render a textarea that calls onChange when the user types, simulating the editor.
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Code editor input"
    />
  ),
}));

import App from '../../App';

/**
 * Helper: set the code in the mocked Monaco editor textarea.
 * Uses fireEvent.change because userEvent.type interprets curly braces
 * as keyboard modifier descriptors.
 */
function setEditorCode(editor, code) {
  fireEvent.change(editor, { target: { value: code } });
}

/**
 * Helper: navigate through the selection view to the coding view.
 * Mocks Math.random to return 0 so Two Sum (first Easy problem) is always selected.
 */
async function navigateToTwoSum(user) {
  // Wait for the selection view to load
  await waitFor(() => {
    expect(screen.getByTestId('difficulty-Easy')).toBeInTheDocument();
  });

  // Mock Math.random so the first Easy problem (Two Sum) is always selected
  const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

  // Click the Easy difficulty button
  await user.click(screen.getByTestId('difficulty-Easy'));

  randomSpy.mockRestore();

  // Wait for the coding view to load with Two Sum
  await waitFor(() => {
    expect(screen.getByText('Two Sum')).toBeInTheDocument();
  });
}

describe('Integration: Run flow', () => {
  it('loads a problem, accepts user code, runs sample tests, and displays results', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate through selection view to coding view with Two Sum
    await navigateToTwoSum(user);

    // Verify difficulty badge is rendered
    expect(screen.getByText('Easy')).toBeInTheDocument();

    // Switch to JavaScript (default is now Python)
    const jsButton = screen.getByRole('radio', { name: 'JavaScript' });
    await user.click(jsButton);

    // 2. The editor should be pre-populated with starter code
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
    expect(editor.value).toContain('twoSum');

    // 3. Write a correct solution in the editor
    const correctSolution = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`;

    setEditorCode(editor, correctSolution);

    // 4. Click the "Run" button (Requirement 3.1)
    const runButton = screen.getByRole('button', { name: 'Run' });
    expect(runButton).toBeInTheDocument();
    await user.click(runButton);

    // 5. Wait for test results to appear (Requirements 3.1, 3.2)
    await waitFor(() => {
      expect(screen.getByText('Test Results')).toBeInTheDocument();
    });

    // Verify pass/fail indicators are displayed for sample test cases
    // The Two Sum problem has 3 sample test cases: sample-1, sample-2, sample-3
    await waitFor(() => {
      expect(screen.getByText('sample-1')).toBeInTheDocument();
      expect(screen.getByText('sample-2')).toBeInTheDocument();
      expect(screen.getByText('sample-3')).toBeInTheDocument();
    });

    // All sample tests should pass with a correct solution
    const passedLabels = screen.getAllByText('Passed');
    expect(passedLabels.length).toBe(3);
  });

  it('displays failure results when code is incorrect', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate through selection view to coding view with Two Sum
    await navigateToTwoSum(user);

    const editor = screen.getByTestId('monaco-editor');

    // Write an incorrect solution that always returns [0, 0]
    setEditorCode(editor, `function twoSum(nums, target) {
  return [0, 0];
}`);

    // Click Run
    await user.click(screen.getByRole('button', { name: 'Run' }));

    // Wait for test results
    await waitFor(() => {
      expect(screen.getByText('Test Results')).toBeInTheDocument();
    });

    // At least some tests should fail with incorrect code
    await waitFor(() => {
      const failedLabels = screen.getAllByText('Failed');
      expect(failedLabels.length).toBeGreaterThan(0);
    });
  });

  it('displays error results when code has a runtime error', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate through selection view to coding view with Two Sum
    await navigateToTwoSum(user);

    const editor = screen.getByTestId('monaco-editor');

    // Write code that throws a runtime error
    setEditorCode(editor, `function twoSum(nums, target) {
  throw new Error("intentional error");
}`);

    // Click Run
    await user.click(screen.getByRole('button', { name: 'Run' }));

    // Wait for test results with error information (Requirement 3.2)
    await waitFor(() => {
      expect(screen.getByText('Test Results')).toBeInTheDocument();
    });

    // All tests should fail
    await waitFor(() => {
      const failedLabels = screen.getAllByText('Failed');
      expect(failedLabels.length).toBe(3);
    });
  });
});
