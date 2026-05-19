import { gradients, palette } from './tokens';

const darkSurface = '#1A1B2E';

/** @typedef {typeof lightColors} ThemeColors */

export const lightColors = {
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
  gradient: [gradients.lightSky.start, gradients.lightSky.end],
};

export const darkColors = {
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
  gradient: [gradients.darkSky.start, gradients.darkSky.end],
};

/**
 * @param {'light' | 'dark'} scheme
 * @returns {ThemeColors}
 */
export function getPalette(scheme) {
  return scheme === 'dark' ? darkColors : lightColors;
}
