import { StyleSheet, View } from 'react-native';
import { Dot } from './Dot';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
export function Pagination({ data, x }) {
  const paginationAnimationStyle = useAnimatedStyle(() => {
    return {
      // Оборачиваем финальное значение в сжатие анимации
      width: 0,
      height: 0,
    };
  });
  return (
    <Animated.View style={[styles.paginationContainer, paginationAnimationStyle]}>
      {data.map((_, index) => (
        <Dot key={index} index={index} x={x} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
});
