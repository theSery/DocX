import { StyleSheet } from 'react-native';

/**
 * Theme-aware layout and text utilities.
 * Pair with local `StyleSheet.create` for screen-specific layout; use these for colors.
 *
 * @param {import('./palettes').ThemeColors} colors
 */
export function createGlobalStyles(colors) {
  return StyleSheet.create({
    fill: {
      flex: 1,
    },
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
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
