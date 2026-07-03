import { Pressable, StyleSheet, Text, View } from 'react-native';
import MoonSvg from '../icons/MoonSvg';
import SunSvg from '../icons/SunSvg';
import { useTheme } from '../../hooks/useTheme';
import { FONT_FAMILY, palette } from '../../theme';

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const THUMB_SIZE = 26;
const THUMB_INSET = 3;

function ThemeSwitch({ isOn }) {
  return (
    <View style={styles.switchWrap} pointerEvents="none">
      <View style={styles.track}>
        <View style={[styles.thumb, isOn ? styles.thumbOn : styles.thumbOff]} />
      </View>
    </View>
  );
}

export function ColorSchemeToggle({ label, description, style }) {
  const { colorScheme, colors, isAnimating, toggle } = useTheme();
  const isDark = colorScheme === 'dark';

  const handlePress = event => {
    if (isAnimating) {
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    toggle(pageX, pageY).catch(() => {});
  };

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark, disabled: isAnimating }}
      accessibilityLabel={`Appearance: ${colorScheme} mode. Double tap to switch.`}
      disabled={isAnimating}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border },
        pressed && styles.rowPressed,
        style,
      ]}>
      <View style={styles.copy}>
        <View style={styles.labelRow}>
          {isDark ? (
            <MoonSvg width={20} height={20} fill={palette.mainBlue} />
          ) : (
            <SunSvg width={20} height={20} fill={palette.mainBlue} />
          )}
          <Text style={[styles.label, { color: colors.text }]}>
            {isDark ? 'Գիշերային ռեժիմ' : 'Ցերեկային ռեժիմ'}
          </Text>
        </View>
      </View>

      <ThemeSwitch isOn={isDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowPressed: {
    opacity: 0.88,
  },
  copy: {
    flex: 1,
    paddingRight: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontFamily: FONT_FAMILY.regular,
    letterSpacing: 0.9,
  },
  switchWrap: {
    padding: 2,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: palette.skyBlue,
    borderWidth: 1,
    borderColor: palette.mainWhite,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    top: (TRACK_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: palette.mainBlue,
  },
  thumbOff: {
    left: THUMB_INSET,
  },
  thumbOn: {
    right: THUMB_INSET,
  },
});
