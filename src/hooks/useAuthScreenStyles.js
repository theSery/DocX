import { useMemo } from 'react';
import { createAuthScreenStyles } from '../screens/authScreens/authScreenStyles';
import { useTheme } from './useTheme';

export function useAuthScreenStyles() {
  const { colors } = useTheme();
  return useMemo(() => createAuthScreenStyles(colors), [colors]);
}
