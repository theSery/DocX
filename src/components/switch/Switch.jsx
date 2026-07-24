import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { palette } from '../../theme';

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const TRACK_PADDING = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

const OFF_TRACK = palette.lightGray;
const OFF_THUMB = palette.pureWhite;
const ON_TRACK = palette.skyBlue;
const ON_THUMB = palette.mainBlue;

export const SWITCH_ANIMATION_MS = 320;

const TIMING = {
  duration: SWITCH_ANIMATION_MS,
  easing: Easing.bezier(0.22, 1, 0.36, 1),
};

/**
 * Controlled switch — thumb position always follows `value`.
 *
 * @param {{
 *   value?: boolean;
 *   onValueChange?: (value: boolean) => void;
 *   disabled?: boolean;
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 * }} props
 */
export function Switch({ value = false, onValueChange, disabled = false, style }) {
  const progress = useSharedValue(value ? 1 : 0);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    const next = value ? 1 : 0;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      progress.value = next;
      return;
    }

    progress.value = withTiming(next, TIMING);
  }, [progress, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [OFF_TRACK, ON_TRACK]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [OFF_THUMB, ON_THUMB]),
    borderColor: interpolateColor(progress.value, [0, 1], [OFF_TRACK, ON_THUMB]),
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
  }));

  const handlePress = () => {
    if (disabled) {
      return;
    }

    onValueChange?.(!value);
  };

  return (
    <Pressable
      style={[styles.pressable, style]}
      onPress={handlePress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: TRACK_PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 1.5,
  },
});
