import { useMemo } from 'react';
import { useTheme } from './useTheme';

export function useStackScreenOptions() {
  const { colors } = useTheme();

  return useMemo(
    () => ({
      headerShown: true,
      headerTintColor: colors.primary,
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.text, fontWeight: '600' },
      headerShadowVisible: false,
    }),
    [colors],
  );
}
