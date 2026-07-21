import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
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

/**
 * Start the theme transition once the thumb is well into the second half,
 * so most of the slide stays uninterrupted.
 */
const SECOND_HALF_THRESHOLD = 0.72;

export const SWITCH_ANIMATION_MS = 320;

const TIMING = {
  duration: SWITCH_ANIMATION_MS,
  easing: Easing.bezier(0.22, 1, 0.36, 1),
};

/**
 * @param {{
 *   value?: boolean;
 *   onValueChange?: (value: boolean) => void;
 *   onSecondHalf?: (value: boolean) => void;
 *   disabled?: boolean;
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 * }} props
 */
export function Switch({
  value = false,
  onValueChange,
  onSecondHalf,
  disabled = false,
  style,
}) {
  const progress = useSharedValue(value ? 1 : 0);
  const targetProgress = useSharedValue(value ? 1 : 0);
  const isAnimating = useSharedValue(false);
  const hasFiredSecondHalf = useSharedValue(false);
  const isFirstRenderRef = useRef(true);
  const onSecondHalfRef = useRef(onSecondHalf);
  onSecondHalfRef.current = onSecondHalf;

  const notifySecondHalf = useCallback(nextValue => {
    onSecondHalfRef.current?.(nextValue);
  }, []);

  const runToggleAnimation = useCallback(
    nextValue => {
      const next = nextValue ? 1 : 0;

      // Already heading to (or settled on) this value — never restart mid-slide.
      if (targetProgress.value === next) {
        return false;
      }

      hasFiredSecondHalf.value = false;
      isAnimating.value = true;
      targetProgress.value = next;
      progress.value = withTiming(next, TIMING, finished => {
        if (finished) {
          isAnimating.value = false;
        }
      });

      return true;
    },
    [hasFiredSecondHalf, isAnimating, progress, targetProgress],
  );

  // Sync from controlled prop only when it differs from our animation target.
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      const next = value ? 1 : 0;
      progress.value = next;
      targetProgress.value = next;
      return;
    }

    runToggleAnimation(value);
  }, [progress, runToggleAnimation, targetProgress, value]);

  useAnimatedReaction(
    () => progress.value,
    current => {
      if (!isAnimating.value || hasFiredSecondHalf.value) {
        return;
      }

      const traveled =
        targetProgress.value === 1 ? current : 1 - current;

      if (traveled >= SECOND_HALF_THRESHOLD) {
        hasFiredSecondHalf.value = true;
        runOnJS(notifySecondHalf)(targetProgress.value === 1);
      }
    },
    [notifySecondHalf],
  );

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [OFF_TRACK, ON_TRACK],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [OFF_THUMB, ON_THUMB],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [OFF_TRACK, ON_THUMB],
    ),
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
  }));

  const handlePress = () => {
    if (disabled || isAnimating.value) {
      return;
    }

    const nextValue = !(targetProgress.value === 1);
    runToggleAnimation(nextValue);
    onValueChange?.(nextValue);
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
