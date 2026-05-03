import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LanguageSelector from '../../components/LanguageSelector';

describe('LanguageSelector', () => {
  const defaultProps = {
    language: 'python',
    onChange: vi.fn(),
  };

  it('renders both Python and JavaScript options', () => {
    render(<LanguageSelector {...defaultProps} />);
    expect(screen.getByRole('radio', { name: 'Python' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'JavaScript' })).toBeInTheDocument();
  });

  it('highlights Python as active when language is "python"', () => {
    render(<LanguageSelector {...defaultProps} language="python" />);
    expect(screen.getByRole('radio', { name: 'Python' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'JavaScript' })).toHaveAttribute('aria-checked', 'false');
  });

  it('highlights JavaScript as active when language is "javascript"', () => {
    render(<LanguageSelector {...defaultProps} language="javascript" />);
    expect(screen.getByRole('radio', { name: 'JavaScript' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Python' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with "javascript" when clicking the inactive JavaScript option', async () => {
    const onChange = vi.fn();
    render(<LanguageSelector language="python" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'JavaScript' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('javascript');
  });

  it('calls onChange with "python" when clicking the inactive Python option', async () => {
    const onChange = vi.fn();
    render(<LanguageSelector language="javascript" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Python' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('python');
  });

  it('does NOT call onChange when clicking the already-active language', async () => {
    const onChange = vi.fn();
    render(<LanguageSelector language="python" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Python' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has an accessible radiogroup role', () => {
    render(<LanguageSelector {...defaultProps} />);
    expect(screen.getByRole('radiogroup', { name: /select coding language/i })).toBeInTheDocument();
  });
});
