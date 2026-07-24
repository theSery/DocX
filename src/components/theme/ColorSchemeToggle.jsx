import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Typography } from '../typography';
import SunSvg from '../icons/SunSvg';
import MoonSvg from '../icons/MoonSvg';
import { useTheme } from '../../hooks/useTheme';
import { ColorScheme } from '../../theme';

/**
 * Light / Dark appearance toggle.
 * Same interaction as example/ColorSchemeButton: tap starts the circular
 * reveal from the finger position.
 *
 * @param {{
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 * }} props
 */
export function ColorSchemeToggle({ style }) {
  const { colors, colorScheme, isAnimating, setColorScheme } = useTheme();
  const isDark = colorScheme === ColorScheme.DARK;

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .enabled(!isAnimating)
        .onStart(e => {
          if (isAnimating) {
            return;
          }

          const nextScheme = isDark ? ColorScheme.LIGHT : ColorScheme.DARK;
          setColorScheme(nextScheme, e.absoluteX, e.absoluteY);
        }),
    [isAnimating, isDark, setColorScheme],
  );

  return (
    <View style={[styles.row, style]}>
      <Typography variant="h5">{isDark ? 'Գիշերային' : 'Ցերեկային'}</Typography>

      <GestureDetector gesture={tap}>
        <View
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          accessibilityState={{ disabled: isAnimating }}
        >
          {isDark ? (
            <SunSvg fill={colors.icons} width={28} height={28} />
          ) : (
            <MoonSvg fill={colors.icons} width={28} height={28} />
          )}
        </View>
      </GestureDetector>
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
  button: {
    padding: 4,
  },
});
