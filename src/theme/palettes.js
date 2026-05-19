import { ColorScheme } from './constants';
import { gradients, palette } from './tokens';

const darkSurface = '#1A1B2E';

/** @typedef {typeof lightColors} ThemeColors */

export const lightColors = Object.freeze({
  text: palette.black,
  textOnDark: palette.white,
  textSecondary: palette.gray,
  textDisabled: palette.lightGray,
  background: palette.backgroundWhite,
  surface: palette.white,
  border: palette.lightGray,
  input: palette.backgroundWhite,
  error: palette.red,
  success: palette.green,
  tag: palette.green,
  skyBlue: palette.skyBlue,
  primary: palette.skyBlue,
  accent: palette.green,
  gradient: Object.freeze([gradients.lightSky.start, gradients.lightSky.end]),
});

export const darkColors = Object.freeze({
  text: palette.white,
  textOnDark: palette.white,
  textSecondary: palette.lightGray,
  textDisabled: palette.gray,
  background: palette.black,
  surface: darkSurface,
  border: palette.gray,
  input: darkSurface,
  error: palette.red,
  success: palette.green,
  tag: palette.green,
  skyBlue: palette.skyBlue,
  primary: palette.skyBlue,
  accent: palette.green,
  gradient: Object.freeze([gradients.darkSky.start, gradients.darkSky.end]),
});

/**
 * Semantic color map for the active color scheme.
 * Use `useTheme().colors` in components instead of calling this directly.
 *
 * @param {import('./constants').ColorSchemeName} scheme
 * @returns {ThemeColors}
 */
export function getPalette(scheme) {
  return scheme === ColorScheme.DARK ? darkColors : lightColors;
}
