// Feature: algo-mentor, Property 6: Timer formatting
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatTime } from '../../utils/timer.js';

// **Validates: Requirements 7.2**

describe('Property 6: Timer formatting', () => {
  it('formatTime returns MM:SS where minutes = Math.floor(seconds / 60) and seconds portion = seconds % 60, both zero-padded', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99999 }),
        (seconds) => {
          const result = formatTime(seconds);

          // 1. The result matches the expected format: digits for minutes (2+), colon, exactly 2 digits for seconds
          expect(result).toMatch(/^\d{2,}:\d{2}$/);

          // 2. Parse back and verify correctness
          const parts = result.split(':');
          const minutesPart = parseInt(parts[0], 10);
          const secondsPart = parseInt(parts[1], 10);

          const expectedMinutes = Math.floor(seconds / 60);
          const expectedSeconds = seconds % 60;

          expect(minutesPart).toBe(expectedMinutes);
          expect(secondsPart).toBe(expectedSeconds);
        }
      ),
      { numRuns: 100 }
    );
  });
});
