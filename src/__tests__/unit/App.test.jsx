import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Feature: enhanced-debrief-and-problems, Property 8: Returning to selection resets all session state

// Mock Monaco Editor — renders a simple textarea
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }) => (
    <textarea data-testid="code-editor" value={value} onChange={(e) => onChange?.(e.target.value)} />
  ),
}));

// Mock the code runner
vi.mock('../../runners/index.js', () => ({
  runCode: vi.fn().mockResolvedValue([]),
}));

import App from '../../App';

/**
 * Helper: navigate from selection view to coding view by clicking a difficulty button.
 * Waits for problems to load first.
 */
async function navigateToCodingView(user) {
  // Wait for problems to load (selection view renders difficulty buttons)
  await waitFor(() => {
    expect(screen.getByText('Choose a Difficulty')).toBeInTheDocument();
  });

  // Click the Easy difficulty button to select a problem
  const easyButton = screen.getByTestId('difficulty-Easy');
  await user.click(easyButton);

  // Verify we're in coding view (ActionBar with Run button is visible)
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
  });
}

/**
 * Helper: click "Change Problem" to return to selection view.
 */
async function clickChangeProblem(user) {
  const changeProblemButton = screen.getByRole('button', { name: /change problem/i });
  await user.click(changeProblemButton);

  // Verify we're back in selection view
  await waitFor(() => {
    expect(screen.getByText('Choose a Difficulty')).toBeInTheDocument();
  });
}

describe('App - Property Tests', () => {
  // **Validates: Requirements 5.6**
  it('Property 8: Returning to selection resets all session state', async () => {
    // We use fast-check to generate a random number of select/change-problem cycles.
    // For each cycle, we:
    //   1. Select a problem (go to coding view)
    //   2. Optionally modify code in the editor
    //   3. Click "Change Problem" to return to selection
    //   4. Verify we're back in selection view (state was reset)
    //   5. Select a new problem and verify fresh starter code (not modified code)

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (cycles, randomCode) => {
          const user = userEvent.setup();
          const { unmount } = render(<App />);

          try {
            for (let i = 0; i < cycles; i++) {
              // Navigate to coding view
              await navigateToCodingView(user);

              // Verify coding view elements are present
              expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
              expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
              expect(screen.getByTestId('code-editor')).toBeInTheDocument();

              // Modify the code in the editor to simulate user activity
              const editor = screen.getByTestId('code-editor');
              fireEvent.change(editor, { target: { value: randomCode } });

              // Click "Change Problem" to return to selection
              await clickChangeProblem(user);

              // Verify selection view is shown (coding view elements are gone)
              expect(screen.queryByRole('button', { name: 'Run' })).not.toBeInTheDocument();
              expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
              expect(screen.queryByTestId('code-editor')).not.toBeInTheDocument();

              // Verify the selection view is fully rendered
              expect(screen.getByText('Choose a Difficulty')).toBeInTheDocument();
            }

            // After all cycles, select a problem one more time and verify fresh state
            await navigateToCodingView(user);
            const editor = screen.getByTestId('code-editor');

            // The editor should have the problem's starter code, not the random code we typed
            expect(editor.value).not.toBe(randomCode);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 } // Reduced runs since each involves async rendering
    );
  });
});

describe('App selection flow unit tests', () => {
  // _Requirements: 4.3, 5.5_

  it('renders selection view on initial load', async () => {
    const { unmount } = render(<App />);

    try {
      // Wait for problems to load and selection view to render
      await waitFor(() => {
        expect(screen.getByText('Choose a Difficulty')).toBeInTheDocument();
      });

      // Verify difficulty buttons are present
      expect(screen.getByTestId('difficulty-Easy')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-Medium')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-Hard')).toBeInTheDocument();

      // Verify coding view elements are NOT present
      expect(screen.queryByRole('button', { name: 'Run' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('coding view has a "Change Problem" control', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    try {
      // Wait for problems to load
      await waitFor(() => {
        expect(screen.getByText('Choose a Difficulty')).toBeInTheDocument();
      });

      // Click a difficulty button to navigate to coding view
      const easyButton = screen.getByTestId('difficulty-Easy');
      await user.click(easyButton);

      // Wait for coding view to render
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
      });

      // Verify "Change Problem" button exists in coding view
      expect(screen.getByRole('button', { name: /change problem/i })).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});

// Mock the debrief service so we can verify language is passed to generateDebrief
vi.mock('../../services/debrief.js', () => ({
  generateDebrief: vi.fn().mockReturnValue({
    correctness: 0,
    timeComplexity: 'O(?)',
    spaceComplexity: 'O(?)',
    codeFeedback: [],
    missedEdgeCases: [],
    alternativeApproaches: [],
    readinessScore: 0,
    elapsedTime: 0,
  }),
}));

import { runCode } from '../../runners/index.js';
import { generateDebrief } from '../../services/debrief.js';

describe('App language integration', () => {
  // _Requirements: 1.1, 1.2, 1.3, 2.2, 2.5_

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to Python language', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    try {
      await navigateToCodingView(user);

      // The Python radio button should be checked by default
      const pythonRadio = screen.getByRole('radio', { name: 'Python' });
      expect(pythonRadio).toHaveAttribute('aria-checked', 'true');

      const jsRadio = screen.getByRole('radio', { name: 'JavaScript' });
      expect(jsRadio).toHaveAttribute('aria-checked', 'false');
    } finally {
      unmount();
    }
  });

  it('loads Python starter code when selecting a problem', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    try {
      await navigateToCodingView(user);

      // The editor should contain Python starter code (def keyword with snake_case)
      const editor = screen.getByTestId('code-editor');
      expect(editor.value).toMatch(/def\s+\w+/);
    } finally {
      unmount();
    }
  });

  it('switches to JavaScript starter code when language is changed', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    try {
      await navigateToCodingView(user);

      // Verify Python starter code is loaded initially
      const editor = screen.getByTestId('code-editor');
      expect(editor.value).toMatch(/def\s+\w+/);

      // Click the JavaScript radio button
      const jsRadio = screen.getByRole('radio', { name: 'JavaScript' });
      await user.click(jsRadio);

      // Editor should now contain JavaScript starter code (function keyword)
      expect(editor.value).toMatch(/function\s+\w+/);
      // Should no longer contain Python def
      expect(editor.value).not.toMatch(/def\s+\w+/);
    } finally {
      unmount();
    }
  });

  it('passes current language to runCode when Run is clicked', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    try {
      await navigateToCodingView(user);

      // Click Run
      const runButton = screen.getByRole('button', { name: 'Run' });
      await user.click(runButton);

      // Verify runCode was called with language: 'python' (the default)
      await waitFor(() => {
        expect(runCode).toHaveBeenCalled();
      });
      expect(runCode.mock.calls[0][0]).toHaveProperty('language', 'python');
    } finally {
      unmount();
    }
  });

  it('passes current language to generateDebrief when Submit is clicked', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    try {
      await navigateToCodingView(user);

      // Click Submit
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      // Verify runCode was called with language: 'python'
      await waitFor(() => {
        expect(runCode).toHaveBeenCalled();
      });
      expect(runCode.mock.calls[0][0]).toHaveProperty('language', 'python');

      // Verify generateDebrief was called with language: 'python'
      await waitFor(() => {
        expect(generateDebrief).toHaveBeenCalled();
      });
      expect(generateDebrief.mock.calls[0][0]).toHaveProperty('language', 'python');
    } finally {
      unmount();
    }
  });
});
