import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MoonSvg from '../icons/MoonSvg';
import SunSvg from '../icons/SunSvg';
import { useTheme } from '../../hooks/useTheme';
import { FONT_FAMILY } from '../../theme';

const TRACK_WIDTH = 70;
const TRACK_HEIGHT = 36;
const THUMB_SIZE = 30;
const THUMB_INSET = 3;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2;

const SUN_TINT = '#E5A319';
const MOON_TINT = '#7B9AE8';
const TRACK_LIGHT = '#F0E6D2';
const TRACK_DARK = '#2C3348';
const THUMB_LIGHT = '#FFF9ED';
const THUMB_DARK = '#3A4460';

/** Thumb slide + colors — timed to feel in step with the app theme transition (~650ms). */
const TOGGLE_ANIMATION_MS = 500;
const TOGGLE_TIMING = {
  duration: TOGGLE_ANIMATION_MS,
  easing: Easing.inOut(Easing.cubic),
};

function ThemeSwitch({ colorScheme, colors }) {
  const isDark = colorScheme === 'dark';
  const progress = useSharedValue(isDark ? 1 : 0);
  const [iconIsMoon, setIconIsMoon] = useState(isDark);

  useEffect(() => {
    progress.value = withTiming(isDark ? 1 : 0, TOGGLE_TIMING);

    const swapTimer = setTimeout(() => {
      setIconIsMoon(isDark);
    }, TOGGLE_ANIMATION_MS / 2);

    return () => clearTimeout(swapTimer);
  }, [isDark, progress]);

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [TRACK_LIGHT, TRACK_DARK]),
  }));

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [THUMB_INSET, THUMB_INSET + THUMB_TRAVEL],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(progress.value, [0, 1], [1.06, 0.96], Extrapolation.CLAMP),
      },
    ],
    backgroundColor: interpolateColor(progress.value, [0, 1], [THUMB_LIGHT, THUMB_DARK]),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.borderSubtle, colors.border],
    ),
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.38, 0.5, 0.62], [1, 0.15, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [1.12, 0.94], Extrapolation.CLAMP),
      },
      {
        rotate: `${interpolate(progress.value, [0, 0.5, 1], [0, 18, -8], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

  return (
    <View style={styles.switchWrap} pointerEvents="none">
      <Animated.View style={[styles.track, trackAnimatedStyle]}>
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
          <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
            {iconIsMoon ? (
              <MoonSvg width={18} height={18} fill={MOON_TINT} />
            ) : (
              <SunSvg width={18} height={18} fill={SUN_TINT} />
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export function ColorSchemeToggle({ label, description, style }) {
  const { colorScheme, colors, isAnimating, toggle } = useTheme();

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
      accessibilityState={{ checked: colorScheme === 'dark', disabled: isAnimating }}
      accessibilityLabel={`Appearance: ${colorScheme} mode. Double tap to switch.`}
      disabled={isAnimating}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border,  },
        pressed && styles.rowPressed,
        style,
      ]}>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text }]}>{colorScheme === 'Լուսավոր թեմա' ? 'Light' : 'Գիշերային ռեժիմ'}</Text>
      </View>
  
      <ThemeSwitch colorScheme={colorScheme} colors={colors} />
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
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    top: (TRACK_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
