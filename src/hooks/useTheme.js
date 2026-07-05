import { useColorSchemeContext } from '../theme/colorScheme';

/**
 * Primary theme hook. Requires `ColorSchemeProvider` (or `LightThemeScope`) above the component.
 */
export function useTheme() {
  const {
    colorScheme,
    themePreference,
    colors,
    isDarkMode,
    isLightModeLocked,
    isAnimating,
    setThemePreference,
  } = useColorSchemeContext();

  return {
    colorScheme,
    themePreference,
    colors,
    isDarkMode,
    isLightModeLocked,
    isAnimating,
    setThemePreference,
  };
}
