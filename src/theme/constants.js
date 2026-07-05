/** @typedef {'light' | 'dark'} ColorSchemeName */
/** @typedef {'system' | 'light' | 'dark'} ThemePreferenceName */

export const ColorScheme = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
});

export const ThemePreference = Object.freeze({
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
});

/** @param {unknown} value */
export function isColorScheme(value) {
  return value === ColorScheme.LIGHT || value === ColorScheme.DARK;
}

/** @param {unknown} value */
export function isThemePreference(value) {
  return (
    value === ThemePreference.SYSTEM ||
    value === ThemePreference.LIGHT ||
    value === ThemePreference.DARK
  );
}
