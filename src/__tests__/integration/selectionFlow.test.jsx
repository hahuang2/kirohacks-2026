import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

// Mock @monaco-editor/react — Monaco requires a real browser environment.
// Render a textarea that calls onChange when the user types, simulating the editor.
// Include data-language attribute so we can verify language switching in debrief.
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, language }) => (
    <textarea
      data-testid="monaco-editor"
      data-language={language}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
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

/**
 * Helper: navigate through the selection view to the coding view with Two Sum.
 * Mocks Math.random to return 0 so Two Sum (first Easy problem) is always selected.
 */
async function navigateToTwoSum(user) {
  await waitFor(() => {
    expect(screen.getByTestId('difficulty-Easy')).toBeInTheDocument();
  });

  const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
  await user.click(screen.getByTestId('difficulty-Easy'));
  randomSpy.mockRestore();

  await waitFor(() => {
    expect(screen.getByText('Two Sum')).toBeInTheDocument();
  });
}

describe('Integration: Selection flow', () => {
  /**
   * Task 9.1: Integration test for selection → coding flow
   * Validates: Requirements 4.3, 4.4, 5.4
   */
  it('navigates from selection view to coding view with a problem loaded', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Wait for selection view to load (difficulty buttons visible)
    await waitFor(() => {
      expect(screen.getByTestId('difficulty-Easy')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-Medium')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-Hard')).toBeInTheDocument();
    });

    // Mock Math.random to return 0 for deterministic selection
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    // Click the Easy difficulty button
    await user.click(screen.getByTestId('difficulty-Easy'));

    randomSpy.mockRestore();

    // Verify coding view loads with a problem (problem title visible)
    await waitFor(() => {
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
    });

    // Verify Run and Submit buttons are present
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    // Verify the editor has starter code (Python is default)
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
    expect(editor.value).toContain('two_sum');
  });

  /**
   * Task 9.2: Integration test for full cycle (selection → coding → debrief → selection)
   * Validates: Requirements 5.5, 5.6
   */
  it('completes a full cycle from selection through coding and debrief back to selection', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate to coding view with Two Sum
    await navigateToTwoSum(user);

    // Switch to JavaScript (default is now Python)
    const jsButton = screen.getByRole('radio', { name: 'JavaScript' });
    await user.click(jsButton);

    // Write a correct solution for Two Sum
    const editor = screen.getByTestId('monaco-editor');
    setEditorCode(editor, correctSolution);

    // Click Submit
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Wait for debrief view
    await waitFor(() => {
      expect(screen.getByText('Debrief')).toBeInTheDocument();
    });

    // Verify debrief sections are shown
    expect(screen.getByText('Interview Readiness Score')).toBeInTheDocument();
    expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
    expect(screen.getByText(/test cases passed/)).toBeInTheDocument();

    // Click "Change Problem" button
    const changeProblemButton = screen.getByRole('button', { name: /change problem/i });
    expect(changeProblemButton).toBeInTheDocument();
    await user.click(changeProblemButton);

    // Verify we're back in selection view
    await waitFor(() => {
      expect(screen.getByTestId('difficulty-Easy')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-Medium')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-Hard')).toBeInTheDocument();
    });

    // Verify coding view elements are gone
    expect(screen.queryByRole('button', { name: 'Run' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(screen.queryByText('Debrief')).not.toBeInTheDocument();
  });

  /**
   * Task 9.3: Integration test for language switching in debrief
   * Validates: Requirements 2.3
   */
  it('switches languages in debrief approach cards and displays correct code', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate to coding view with Two Sum (mock Math.random for deterministic selection)
    await navigateToTwoSum(user);

    // Switch to JavaScript (default is now Python)
    const jsButton = screen.getByRole('radio', { name: 'JavaScript' });
    await user.click(jsButton);

    // Write correct solution and submit
    const editor = screen.getByTestId('monaco-editor');
    setEditorCode(editor, correctSolution);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Wait for debrief view
    await waitFor(() => {
      expect(screen.getByText('Debrief')).toBeInTheDocument();
    });

    // Find the language tabs in the approach cards — Two Sum has 3 approaches,
    // each with javascript/python/java tabs. The default should be javascript.
    const pythonTabs = screen.getAllByTestId('lang-tab-python');
    expect(pythonTabs.length).toBeGreaterThan(0);

    // Click the "python" tab on the first approach card
    await user.click(pythonTabs[0]);

    // Verify the editor in that approach shows Python code (check data-language attribute)
    // After clicking python, at least one editor should have data-language="python"
    await waitFor(() => {
      const editors = screen.getAllByTestId('monaco-editor');
      const pythonEditors = editors.filter((el) => el.getAttribute('data-language') === 'python');
      expect(pythonEditors.length).toBeGreaterThan(0);
    });

    // Click the "java" tab on the first approach card
    const javaTabs = screen.getAllByTestId('lang-tab-java');
    expect(javaTabs.length).toBeGreaterThan(0);
    await user.click(javaTabs[0]);

    // Verify the editor shows Java code
    await waitFor(() => {
      const editors = screen.getAllByTestId('monaco-editor');
      const javaEditors = editors.filter((el) => el.getAttribute('data-language') === 'java');
      expect(javaEditors.length).toBeGreaterThan(0);
    });
  });
});
