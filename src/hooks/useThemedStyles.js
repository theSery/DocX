import { useMemo } from 'react';
import { useTheme } from './useTheme';

/**
 * Memoizes styles from a stable factory that receives theme colors.
 * The factory must be defined at module scope (not inline) so referential equality stays stable.
 *
 * @template T
 * @param {(colors: import('../theme/palettes').ThemeColors) => T} createStyles
 * @returns {T}
 */
export function useThemedStyles(createStyles) {
  const { colors } = useTheme();

  return useMemo(() => createStyles(colors), [colors, createStyles]);
}
