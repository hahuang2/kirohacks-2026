import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Timer from '../../components/Timer';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    running: false,
    elapsedTime: 0,
    onTick: vi.fn(),
  };

  it('displays formatted elapsed time as 00:00 when elapsedTime is 0', () => {
    render(<Timer {...defaultProps} />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('displays formatted elapsed time for non-zero values', () => {
    render(<Timer {...defaultProps} elapsedTime={125} />);
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('calls onTick every second when running is true', () => {
    const onTick = vi.fn();
    render(<Timer running={true} elapsedTime={0} onTick={onTick} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenCalledWith(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('does not call onTick when running is false', () => {
    const onTick = vi.fn();
    render(<Timer running={false} elapsedTime={0} onTick={onTick} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onTick).not.toHaveBeenCalled();
  });

  it('stops calling onTick when running changes from true to false', () => {
    const onTick = vi.fn();
    const { rerender } = render(<Timer running={true} elapsedTime={0} onTick={onTick} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onTick).toHaveBeenCalledTimes(2);

    rerender(<Timer running={false} elapsedTime={2} onTick={onTick} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // Should still be 2 — no additional calls after stopping
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('passes the incremented elapsed time to onTick', () => {
    const onTick = vi.fn();
    render(<Timer running={true} elapsedTime={10} onTick={onTick} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onTick).toHaveBeenCalledWith(11);
  });

  it('has an accessible label for elapsed time', () => {
    render(<Timer {...defaultProps} />);
    expect(screen.getByLabelText('Elapsed time')).toBeInTheDocument();
  });
});
