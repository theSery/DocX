import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';

export function Dot({ index, x }) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const animatedDotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const widthAnimation = interpolate(
      x.value,
      inputRange,
      [12, 28, 12],
      Extrapolation.CLAMP,
    );

    const opacityAnimation = interpolate(
      x.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    );

    return {
      width: widthAnimation,
      opacity: opacityAnimation,
    };
  });

  const animatedColor = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      x.value,
      [0, SCREEN_WIDTH, 2 * SCREEN_WIDTH],
      ['#82C8E5A3', '#82C8E5A3', '#82C8E5A3'],
    );

    return { backgroundColor };
  });

  return (
    <Animated.View style={[styles.dot, animatedDotStyle, animatedColor]} />
  );
}

const styles = StyleSheet.create({
  dot: {
    height: 8,
    marginHorizontal: 6,
    borderRadius: 4,
  },
});
