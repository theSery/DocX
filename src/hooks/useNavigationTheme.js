import { useMemo } from 'react';
import { createNavigationTheme } from '../theme/navigationTheme';
import { useTheme } from './useTheme';

export function useNavigationTheme() {
  const { colors, isDarkMode } = useTheme();

  return useMemo(() => createNavigationTheme(colors, isDarkMode), [colors, isDarkMode]);
}
