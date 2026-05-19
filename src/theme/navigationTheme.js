import { DarkTheme, DefaultTheme } from '@react-navigation/native';

/**
 * React Navigation theme object aligned with app semantic colors.
 *
 * @param {import('./palettes').ThemeColors} colors
 * @param {boolean} isDarkMode
 */
export function createNavigationTheme(colors, isDarkMode) {
  const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark: isDarkMode,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };
}
