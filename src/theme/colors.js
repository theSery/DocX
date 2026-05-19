/**
 * Theme public API — semantic palettes, tokens, and style factories.
 * Prefer `useTheme()` / `useGlobalStyles()` in components over static imports.
 */
export { ColorScheme, isColorScheme } from './constants';
export { createGlobalStyles } from './globalStyles';
export { createNavigationTheme } from './navigationTheme';
export { createStackScreenOptions } from './stackScreenOptions';
export { darkColors, getPalette, lightColors } from './palettes';
export { gradients, palette } from './tokens';
export { FONT_FAMILY } from './fonts';

/** @deprecated Use `useTheme().colors` for theme-aware colors. */
export { lightColors as colors } from './palettes';
