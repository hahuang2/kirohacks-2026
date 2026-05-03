import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import ApproachCard from '../../components/ApproachCard';

// Mock @monaco-editor/react since jsdom can't render Monaco
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, language }) => (
    <pre data-testid="monaco-editor" data-language={language}>{value}</pre>
  ),
}));

afterEach(() => {
  cleanup();
});

// Shared arbitrary builders
const languageKeysArb = fc.subarray(['javascript', 'python', 'java'], { minLength: 1 });

function buildApproachArb() {
  return fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.string({ minLength: 1, maxLength: 50 }),
    timeComplexity: fc.string({ minLength: 1, maxLength: 50 }),
    spaceComplexity: fc.string({ minLength: 1, maxLength: 50 }),
  }).chain((base) =>
    languageKeysArb.chain((langs) => {
      const codeSolutionsArb = fc.record(
        Object.fromEntries(
          langs.map((lang) => [lang, fc.string({ minLength: 1, maxLength: 200 })])
        )
      );
      return codeSolutionsArb.map((codeSolutions) => ({
        ...base,
        codeSolutions,
      }));
    })
  );
}

// Feature: enhanced-debrief-and-problems, Property 1: Approach metadata is always present regardless of language selection

// **Validates: Requirements 1.3, 2.5**

describe('Property 1: Approach metadata is always present regardless of language selection', () => {
  it('name, description, timeComplexity, and spaceComplexity are always rendered for any approach with codeSolutions', () => {
    fc.assert(
      fc.property(buildApproachArb(), (approach) => {
        cleanup();
        const { container } = render(<ApproachCard approach={approach} />);
        const card = container.firstChild;

        // Verify all metadata fields are present in the rendered output
        expect(card.textContent).toContain(approach.name);
        expect(card.textContent).toContain(approach.description);
        expect(card.textContent).toContain(approach.timeComplexity);
        expect(card.textContent).toContain(approach.spaceComplexity);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: enhanced-debrief-and-problems, Property 2: Language switching displays the correct code

// **Validates: Requirements 2.3**

describe('Property 2: Language switching displays the correct code', () => {
  it('clicking each language tab causes the editor to display the correct code for that language', () => {
    fc.assert(
      fc.property(buildApproachArb(), (approach) => {
        cleanup();
        const { container } = render(<ApproachCard approach={approach} />);
        const wrapper = within(container);

        const languages = Object.keys(approach.codeSolutions);
        for (const lang of languages) {
          const tab = wrapper.getByTestId(`lang-tab-${lang}`);
          fireEvent.click(tab);

          const editor = wrapper.getByTestId('monaco-editor');
          // Use textContent directly to avoid testing-library whitespace normalization
          expect(editor.textContent).toBe(approach.codeSolutions[lang]);
          expect(editor).toHaveAttribute('data-language', lang);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: enhanced-debrief-and-problems, Property 3: Language selector shows exactly the available languages

// **Validates: Requirements 2.4**

describe('Property 3: Language selector shows exactly the available languages', () => {
  it('the set of rendered language tabs matches exactly the keys in codeSolutions', () => {
    fc.assert(
      fc.property(buildApproachArb(), (approach) => {
        cleanup();
        const { container } = render(<ApproachCard approach={approach} />);

        const expectedLanguages = new Set(Object.keys(approach.codeSolutions));
        const allPossibleLangs = ['javascript', 'python', 'java'];
        const renderedLanguages = new Set();

        for (const lang of allPossibleLangs) {
          const tab = container.querySelector(`[data-testid="lang-tab-${lang}"]`);
          if (tab) {
            renderedLanguages.add(lang);
          }
        }

        expect(renderedLanguages).toEqual(expectedLanguages);
      }),
      { numRuns: 100 }
    );
  });
});

// --- Unit Tests for ApproachCard ---

const approachWithCode = {
  name: 'Hash Map',
  description: 'Use a hash map for O(1) lookups.',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  codeSolutions: {
    javascript: 'function solve() { return 1; }',
    python: 'def solve(): return 1',
    java: 'int solve() { return 1; }',
  },
};

const approachWithoutCode = {
  name: 'Brute Force',
  description: 'Check every pair of elements.',
  timeComplexity: 'O(n^2)',
  spaceComplexity: 'O(1)',
};

describe('ApproachCard unit tests', () => {
  it('renders code snippet and language tabs when codeSolutions are present', () => {
    render(<ApproachCard approach={approachWithCode} />);

    // Monaco editor mock is rendered
    expect(screen.getByTestId('monaco-editor')).toBeTruthy();

    // All three language tabs are present
    expect(screen.getByTestId('lang-tab-javascript')).toBeTruthy();
    expect(screen.getByTestId('lang-tab-python')).toBeTruthy();
    expect(screen.getByTestId('lang-tab-java')).toBeTruthy();
  });

  it('renders without code editor or language tabs when codeSolutions is absent', () => {
    render(<ApproachCard approach={approachWithoutCode} />);

    // No Monaco editor rendered
    expect(screen.queryByTestId('monaco-editor')).toBeNull();

    // No language tabs rendered
    expect(screen.queryByTestId('lang-tab-javascript')).toBeNull();
    expect(screen.queryByTestId('lang-tab-python')).toBeNull();
    expect(screen.queryByTestId('lang-tab-java')).toBeNull();

    // Metadata is still shown
    expect(screen.getByText('Brute Force')).toBeTruthy();
    expect(screen.getByText('Check every pair of elements.')).toBeTruthy();
    expect(screen.getByText(/O\(n\^2\)/)).toBeTruthy();
    expect(screen.getByText(/O\(1\)/)).toBeTruthy();
  });

  it('defaults to JavaScript when present in codeSolutions', () => {
    render(<ApproachCard approach={approachWithCode} />);

    const editor = screen.getByTestId('monaco-editor');

    // Editor shows JavaScript code by default
    expect(editor).toHaveAttribute('data-language', 'javascript');
    expect(editor.textContent).toBe('function solve() { return 1; }');
  });
});
