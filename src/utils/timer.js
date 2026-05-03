/**
 * Formats a number of seconds into a MM:SS string with zero-padded minutes and seconds.
 * @param {number} seconds - Non-negative integer representing elapsed seconds
 * @returns {string} Formatted time string in MM:SS format
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
