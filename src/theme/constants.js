/** @typedef {'light' | 'dark'} ColorSchemeName */

export const ColorScheme = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
});

/** @param {unknown} value */
export function isColorScheme(value) {
  return value === ColorScheme.LIGHT || value === ColorScheme.DARK;
}
