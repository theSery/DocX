import { useMemo } from 'react';
import { createMainScreenStyles } from '../screens/main/mainScreenStyles';
import { useTheme } from './useTheme';

export function useMainScreenStyles() {
  const { colors } = useTheme();
  return useMemo(() => createMainScreenStyles(colors), [colors]);
}
