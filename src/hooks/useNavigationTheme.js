import { useMemo } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTheme } from './useTheme';

export function useNavigationTheme() {
  const { colors, isDarkMode } = useTheme();

  return useMemo(() => {
    const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      dark: isDarkMode,
      colors: {
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [colors, isDarkMode]);
}
