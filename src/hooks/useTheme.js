import { useColorSchemeContext } from '../theme/colorScheme';

export function useTheme() {
  const { colorScheme, colors, isDarkMode, isAnimating, toggle } = useColorSchemeContext();

  return {
    colorScheme,
    colors,
    isDarkMode,
    isAnimating,
    toggle,
  };
}
