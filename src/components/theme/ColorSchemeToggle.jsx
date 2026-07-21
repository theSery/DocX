import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Switch } from '../switch';
import { Typography } from '../typography';
import SunSvg from '../icons/SunSvg';
import MoonSvg from '../icons/MoonSvg';
import { useTheme } from '../../hooks/useTheme';
import { ColorScheme, ThemePreference } from '../../theme';

/**
 * Light / Dark appearance toggle.
 * Starts the theme reveal late in the switch travel so the thumb keeps a
 * continuous slide while both animations overlap briefly at the end.
 *
 * @param {{
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 * }} props
 */
export function ColorSchemeToggle({ style }) {
  const { colors, colorScheme, isAnimating, setThemePreference } = useTheme();
  const isDarkMode = colorScheme === ColorScheme.DARK;

  const [optimisticDark, setOptimisticDark] = useState(null);
  const switchRef = useRef(null);
  const pendingDarkRef = useRef(null);
  const themeStartedRef = useRef(false);

  const isDark = optimisticDark ?? isDarkMode;

  useEffect(() => {
    if (optimisticDark === null) {
      return;
    }

    if (isDarkMode === optimisticDark && !isAnimating) {
      pendingDarkRef.current = null;
      themeStartedRef.current = false;
      setOptimisticDark(null);
    }
  }, [isAnimating, isDarkMode, optimisticDark]);

  const handleValueChange = useCallback(
    nextDark => {
      if (isAnimating || pendingDarkRef.current !== null) {
        return;
      }

      pendingDarkRef.current = nextDark;
      themeStartedRef.current = false;
      setOptimisticDark(nextDark);
    },
    [isAnimating],
  );

  const handleSecondHalf = useCallback(
    nextDark => {
      if (pendingDarkRef.current !== nextDark || themeStartedRef.current) {
        return;
      }

      themeStartedRef.current = true;
      const preference = nextDark ? ThemePreference.DARK : ThemePreference.LIGHT;

      const applyTheme = (x, y, width, height) => {
        setThemePreference(preference, x + width / 2, y + height / 2).catch(() => {
          pendingDarkRef.current = null;
          themeStartedRef.current = false;
          setOptimisticDark(null);
        });
      };

      // Let the current switch frame commit before heavy theme capture work.
      requestAnimationFrame(() => {
        if (switchRef.current?.measureInWindow) {
          switchRef.current.measureInWindow(applyTheme);
          return;
        }

        setThemePreference(preference, 0, 0).catch(() => {
          pendingDarkRef.current = null;
          themeStartedRef.current = false;
          setOptimisticDark(null);
        });
      });
    },
    [setThemePreference],
  );

  return (
    <View style={[styles.row, style]}>
      <View style={styles.labelRow}>
        {isDark ? (
          <MoonSvg fill={colors.mainBlue} width={20} height={20} />
        ) : (
          <SunSvg fill={colors.mainBlue} width={20} height={20} />
        )}
        <Typography variant="h5">{isDark ? 'Գիշերային' : 'Ցերեկային'}</Typography>
      </View>

      <View ref={switchRef} collapsable={false}>
        <Switch
          value={isDark}
          onValueChange={handleValueChange}
          onSecondHalf={handleSecondHalf}
          disabled={isAnimating}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
});
