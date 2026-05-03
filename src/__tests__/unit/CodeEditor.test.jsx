import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock @monaco-editor/react since Monaco requires a real browser environment
let capturedProps = {};
vi.mock('@monaco-editor/react', () => ({
  default: (props) => {
    capturedProps = props;
    return (
      <div data-testid="monaco-editor" data-language={props.language}>
        {props.value}
      </div>
    );
  },
}));

import CodeEditor from '../../components/CodeEditor';

describe('CodeEditor', () => {
  it('renders the Monaco editor', () => {
    render(<CodeEditor code="// hello" onChange={() => {}} />);
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('configures the editor for JavaScript syntax highlighting', () => {
    render(<CodeEditor code="" onChange={() => {}} language="javascript" />);
    expect(capturedProps.language).toBe('javascript');
  });

  it('passes the code prop as the editor value', () => {
    const code = 'function twoSum(nums, target) {}';
    render(<CodeEditor code={code} onChange={() => {}} />);
    expect(capturedProps.value).toBe(code);
  });

  it('forwards editor content changes to onChange', () => {
    const handleChange = vi.fn();
    render(<CodeEditor code="" onChange={handleChange} />);

    // Simulate Monaco calling the onChange callback
    capturedProps.onChange('new code');
    expect(handleChange).toHaveBeenCalledWith('new code');
  });

  it('passes empty string to onChange when editor value is undefined', () => {
    const handleChange = vi.fn();
    render(<CodeEditor code="" onChange={handleChange} />);

    // Monaco can pass undefined when the editor is cleared
    capturedProps.onChange(undefined);
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('has an accessible section label', () => {
    render(<CodeEditor code="" onChange={() => {}} />);
    expect(
      screen.getByRole('region', { name: /code editor/i })
    ).toBeInTheDocument();
  });

  it('uses the vs-dark theme', () => {
    render(<CodeEditor code="" onChange={() => {}} />);
    expect(capturedProps.theme).toBe('vs-dark');
  });

  it('configures the editor for Python syntax highlighting', () => {
    render(<CodeEditor code="" onChange={() => {}} language="python" />);
    expect(capturedProps.language).toBe('python');
  });

  it('passes the language prop through to Monaco data attribute', () => {
    render(<CodeEditor code="" onChange={() => {}} language="python" />);
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-language', 'python');
  });
});
