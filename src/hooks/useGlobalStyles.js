import { useMemo } from 'react';
import { createGlobalStyles } from '../theme/globalStyles';
import { useTheme } from './useTheme';

export function useGlobalStyles() {
  const { colors } = useTheme();
  return useMemo(() => createGlobalStyles(colors), [colors]);
}
