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

describe('Integration: Hint flow', () => {
  it('loads problem, requests a hint, and displays it in the hint area', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate through selection view to coding view with Two Sum
    await navigateToTwoSum(user);

    // 2. Optionally set partial code in the editor to simulate a user working
    const editor = screen.getByTestId('monaco-editor');
    setEditorCode(editor, `function twoSum(nums, target) {
  // thinking about how to solve this...
}`);

    // 3. Click the "Get Hint" button (Requirement 6.2)
    const hintButton = screen.getByRole('button', { name: /get hint/i });
    expect(hintButton).toBeInTheDocument();
    await user.click(hintButton);

    // 4. Verify the hint display area appears with the "Hints" heading (Requirement 6.5)
    await waitFor(() => {
      expect(screen.getByText('Hints')).toBeInTheDocument();
    });

    // 5. Verify the first hint is labeled "Hint 1:" and contains text
    expect(screen.getByText('Hint 1:')).toBeInTheDocument();
  });

  it('displays successive hints that are different (Requirement 6.3)', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate through selection view to coding view with Two Sum
    await navigateToTwoSum(user);

    // Set partial code — no approach keywords so hints start from the beginning
    const editor = screen.getByTestId('monaco-editor');
    setEditorCode(editor, `function twoSum(nums, target) {
  // not sure where to start
}`);

    // Click "Get Hint" for the first hint
    const hintButton = screen.getByRole('button', { name: /get hint/i });
    await user.click(hintButton);

    // Wait for first hint
    await waitFor(() => {
      expect(screen.getByText('Hint 1:')).toBeInTheDocument();
    });

    // Capture the first hint text
    const hint1Element = screen.getByText('Hint 1:').closest('li');
    const hint1Text = hint1Element.textContent;

    // Click "Get Hint" again for a second hint
    await user.click(hintButton);

    // Wait for second hint to appear
    await waitFor(() => {
      expect(screen.getByText('Hint 2:')).toBeInTheDocument();
    });

    // Capture the second hint text
    const hint2Element = screen.getByText('Hint 2:').closest('li');
    const hint2Text = hint2Element.textContent;

    // Verify successive hints are different (Requirement 6.3)
    expect(hint1Text).not.toBe(hint2Text);
  });

  it('displays hints without revealing the complete solution (Requirement 6.4)', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate through selection view to coding view with Two Sum
    await navigateToTwoSum(user);

    // Click "Get Hint" with starter code
    const hintButton = screen.getByRole('button', { name: /get hint/i });
    await user.click(hintButton);

    // Wait for hint to appear
    await waitFor(() => {
      expect(screen.getByText('Hint 1:')).toBeInTheDocument();
    });

    // The hint text should not contain a complete function implementation
    const hintElement = screen.getByText('Hint 1:').closest('li');
    const hintText = hintElement.textContent;

    // A complete solution would contain both a function definition and a return statement
    // with array indexing — hints should guide, not solve
    expect(hintText).not.toMatch(/function\s+twoSum\s*\(.*\)\s*\{[\s\S]*return\s*\[/);
  });
});
