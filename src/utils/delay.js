/**
 * Resolves after the given number of milliseconds.
 *
 * Useful for debouncing async work (e.g. waiting for the user to stop typing
 * before computing search results) without pulling in a debounce library.
 *
 * @param {number} [ms=0] Milliseconds to wait before resolving.
 * @returns {Promise<void>}
 */
export function delay(ms = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
