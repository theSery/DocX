import { StyleSheet } from 'react-native';

/**
 * Theme-aware layout and text utilities.
 * Default text color is Black in light mode and Pure White in dark mode.
 *
 * @param {import('./palettes').ThemeColors} colors
 */
export function createGlobalStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    surface: {
      backgroundColor: colors.surface,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
    },
    text: {
      color: colors.text,
    },
    textOnDark: {
      color: colors.textOnDark,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textDisabled: {
      color: colors.textDisabled,
    },
    textError: {
      color: colors.error,
    },
    textSuccess: {
      color: colors.success,
    },
    textTag: {
      color: colors.tag,
    },
    textSkyBlue: {
      color: colors.skyBlue,
    },
    border: {
      borderColor: colors.border,
    },
  });
}
