import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ActionBar from '../../components/ActionBar';

describe('ActionBar', () => {
  const defaultProps = {
    onRun: vi.fn(),
    onSubmit: vi.fn(),
    onGetHint: vi.fn(),
    isRunning: false,
  };

  it('renders Run, Submit, and Get Hint buttons', () => {
    render(<ActionBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get Hint' })).toBeInTheDocument();
  });

  it('calls onRun when Run button is clicked', async () => {
    const onRun = vi.fn();
    render(<ActionBar {...defaultProps} onRun={onRun} />);
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when Submit button is clicked', async () => {
    const onSubmit = vi.fn();
    render(<ActionBar {...defaultProps} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onGetHint when Get Hint button is clicked', async () => {
    const onGetHint = vi.fn();
    render(<ActionBar {...defaultProps} onGetHint={onGetHint} />);
    await userEvent.click(screen.getByRole('button', { name: 'Get Hint' }));
    expect(onGetHint).toHaveBeenCalledTimes(1);
  });

  it('disables all buttons when isRunning is true', () => {
    render(<ActionBar {...defaultProps} isRunning={true} />);
    expect(screen.getByRole('button', { name: 'Run' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Get Hint' })).toBeDisabled();
  });

  it('enables all buttons when isRunning is false', () => {
    render(<ActionBar {...defaultProps} isRunning={false} />);
    expect(screen.getByRole('button', { name: 'Run' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Get Hint' })).toBeEnabled();
  });

  it('does not call callbacks when buttons are disabled', async () => {
    const onRun = vi.fn();
    const onSubmit = vi.fn();
    const onGetHint = vi.fn();
    render(
      <ActionBar
        onRun={onRun}
        onSubmit={onSubmit}
        onGetHint={onGetHint}
        isRunning={true}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Get Hint' }));
    expect(onRun).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onGetHint).not.toHaveBeenCalled();
  });

  it('has an accessible toolbar role', () => {
    render(<ActionBar {...defaultProps} />);
    expect(screen.getByRole('toolbar', { name: /action bar/i })).toBeInTheDocument();
  });
});
