import { useEffect, useRef } from 'react';
import { formatTime } from '../utils/timer.js';

/**
 * Timer displays elapsed time in MM:SS format and ticks every second while running.
 *
 * Props:
 *   running     — Boolean; when true, calls onTick every second via setInterval
 *   elapsedTime — Current elapsed time in seconds
 *   onTick      — Callback invoked each second with the updated elapsed time
 */
export default function Timer({ running, elapsedTime, onTick }) {
  const onTickRef = useRef(onTick);
  const elapsedTimeRef = useRef(elapsedTime);

  // Keep refs in sync so the interval always uses the latest values
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      onTickRef.current(elapsedTimeRef.current + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm font-mono" aria-label="Elapsed time">
      <span aria-hidden="true">⏱</span>
      <time>{formatTime(elapsedTime)}</time>
    </div>
  );
}
