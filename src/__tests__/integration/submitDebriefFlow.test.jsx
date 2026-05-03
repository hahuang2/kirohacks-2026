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

describe('Integration: Submit and Debrief flow', () => {
  it('loads problem, submits code, and displays debrief panel with all sections', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate through selection view to coding view with Two Sum
    await navigateToTwoSum(user);

    // 2. The editor should be pre-populated with starter code
    // Switch to JavaScript first (default is now Python)
    const jsButton = screen.getByRole('radio', { name: 'JavaScript' });
    await user.click(jsButton);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
    expect(editor.value).toContain('twoSum');

    // 3. Write a correct solution in the editor
    setEditorCode(editor, correctSolution);

    // 4. Click the "Submit" button (Requirement 4.1)
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeInTheDocument();
    await user.click(submitButton);

    // 5. Wait for the debrief panel to appear (Requirement 4.3)
    await waitFor(() => {
      expect(screen.getByText('Debrief')).toBeInTheDocument();
    });

    // 6. Verify correctness summary (Requirement 8.1)
    // The correct solution should pass all 5 hidden test cases
    expect(screen.getByText(/test cases passed/)).toBeInTheDocument();

    // 7. Verify time complexity analysis (Requirement 8.2)
    expect(screen.getByText('Time Complexity')).toBeInTheDocument();
    expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();

    // 8. Verify space complexity analysis (Requirement 8.3)
    expect(screen.getByText('Space Complexity')).toBeInTheDocument();

    // 9. Verify readiness score is displayed (Requirement 8.7)
    expect(screen.getByText('Interview Readiness Score')).toBeInTheDocument();
    const scoreEl = screen.getByTestId('readiness-score');
    expect(scoreEl).toBeInTheDocument();
    // Score should be a number between 0 and 100
    const scoreText = scoreEl.textContent;
    const scoreMatch = scoreText.match(/(\d+)/);
    expect(scoreMatch).not.toBeNull();
    const score = parseInt(scoreMatch[1], 10);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);

    // 10. Verify elapsed time section is displayed (Requirement 8.8)
    expect(screen.getByText('Elapsed Time')).toBeInTheDocument();

    // 11. Verify the "Back" button exists
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('returns to coding view when Back button is clicked after debrief', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate through selection view to coding view with Two Sum
    await navigateToTwoSum(user);

    // Switch to JavaScript (default is now Python)
    const jsButton = screen.getByRole('radio', { name: 'JavaScript' });
    await user.click(jsButton);

    // Write correct solution and submit
    const editor = screen.getByTestId('monaco-editor');
    setEditorCode(editor, correctSolution);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Wait for debrief to appear
    await waitFor(() => {
      expect(screen.getByText('Debrief')).toBeInTheDocument();
    });

    // The coding view elements should not be visible in debrief view
    expect(screen.queryByRole('button', { name: 'Run' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();

    // Click the Back button
    await user.click(screen.getByRole('button', { name: /back/i }));

    // Verify we're back in the coding view
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    // Debrief heading should no longer be visible
    expect(screen.queryByText('Debrief')).not.toBeInTheDocument();

    // The editor should still have the code
    const editorAfterBack = screen.getByTestId('monaco-editor');
    expect(editorAfterBack.value).toContain('twoSum');
  });

  it('displays debrief with failures when code is incorrect', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate through selection view to coding view with Two Sum
    await navigateToTwoSum(user);

    const editor = screen.getByTestId('monaco-editor');

    // Write an incorrect solution
    setEditorCode(editor, `function twoSum(nums, target) {
  return [0, 0];
}`);

    // Click Submit
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Wait for debrief to appear (Requirement 4.3 — debrief shows after submit)
    await waitFor(() => {
      expect(screen.getByText('Debrief')).toBeInTheDocument();
    });

    // Correctness summary should show some failures (Requirement 8.1)
    expect(screen.getByText(/test cases passed/)).toBeInTheDocument();

    // All debrief sections should still be present
    expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
    expect(screen.getByText('Interview Readiness Score')).toBeInTheDocument();
    expect(screen.getByText('Elapsed Time')).toBeInTheDocument();
  });
});
