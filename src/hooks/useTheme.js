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
    toggle,
  } = useColorSchemeContext();

  return {
    colorScheme,
    colors,
    isDarkMode,
    isLightModeLocked,
    isAnimating,
    toggle,
  };
}
