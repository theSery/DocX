import { useColorSchemeContext } from '../theme/colorScheme';

/**
 * Primary theme hook. Requires `ColorSchemeProvider` (or `LightThemeScope`) above the component.
 */
export function useTheme() {
  const {
    colorScheme,
    colors,
    isDarkMode,
    isLightModeLocked,
    isAnimating,
    setColorScheme,
  } = useColorSchemeContext();

  return {
    colorScheme,
    colors,
    isDarkMode,
    isLightModeLocked,
    isAnimating,
    setColorScheme,
  };
}
