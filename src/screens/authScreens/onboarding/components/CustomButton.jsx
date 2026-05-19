import { StyleSheet, TouchableWithoutFeedback, useWindowDimensions } from 'react-native';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Typography } from '../../../../components/typography';

export function CustomButton({
  flatListRef,
  flatListIndex,
  dataLength,
  x,
  onComplete,
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const buttonWidth = flatListIndex.value === dataLength - 1 ? SCREEN_WIDTH * 0.8 : 140;
  // console.log(flatListIndex.value === dataLength - 1, 'ppp')
  // const buttonAnimationStyle = useAnimatedStyle(() => ({
  //   width:
  //     flatListIndex.value === dataLength - 1 ? withSpring(140) : withSpring(60),
  //   height: 60,
  // }));
  const buttonAnimationStyle = useAnimatedStyle(() => {
    // 1. Выносим условие в отдельную переменную для удобства
    const isLastElement = flatListIndex.value === dataLength - 1;
  

    return {
      width: isLastElement ? withSpring(140) : withSpring(60),
      height: 60,
    };
  });
  const arrowAnimationStyle = useAnimatedStyle(() => ({
    opacity:
      flatListIndex.value === dataLength - 1 ? withTiming(0) : withTiming(1),
    transform: [
      {
        translateX:
          flatListIndex.value === dataLength - 1
            ? withTiming(100)
            : withTiming(0),
      },
    ],
  }));

  const textAnimationStyle = useAnimatedStyle(() => ({
    opacity:
      flatListIndex.value === dataLength - 1 ? withTiming(1) : withTiming(0),
    transform: [
      {
        translateX:
          flatListIndex.value === dataLength - 1
            ? withTiming(0)
            : withTiming(-100),
      },
    ],
  }));

  const animatedColor = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      x.value,
      [0, SCREEN_WIDTH, 2 * SCREEN_WIDTH],
      ['#386FE5', '#1D4ED8', '#60A5FA'],
    );

    return { backgroundColor };
  });

  const handlePress = () => {
    if (flatListIndex.value < dataLength - 1) {
      flatListRef.current?.scrollToIndex({ index: flatListIndex.value + 1 });
    } else {
      onComplete();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[styles.container, buttonAnimationStyle, animatedColor]}
      >
        <Animated.View style={[styles.textWrapper, textAnimationStyle]}>
          <Typography variant="h5" style={styles.textButton}>
            Շարունակել
          </Typography>
        </Animated.View>
        <Animated.View style={[styles.arrowWrapper, arrowAnimationStyle]}>
          <Typography variant="h4" style={styles.arrow}>
            →
          </Typography>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  arrowWrapper: {
    position: 'absolute',
  },
  arrow: {
    color: '#FFFFFF',
  },
  textWrapper: {
    position: 'absolute',
  },
  textButton: {
    color: '#FFFFFF',
  },
});
