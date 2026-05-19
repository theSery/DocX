import {
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Typography } from '../../../../components/typography';
import GradientButton from '../../../../components/buttons/GradientButton';

const BUTTON_SIZE = 60;

export function CustomButton({
  flatListRef,
  flatListIndex,
  dataLength,
  x,
  onComplete,
  currentIndex,
  isBackButton = false,
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isHidden = isBackButton && currentIndex === 0;

  const buttonAnimationStyle = useAnimatedStyle(() => ({
    width: isBackButton
      ? BUTTON_SIZE
      : flatListIndex.value === dataLength - 1
        ? withSpring(140)
        : withSpring(BUTTON_SIZE),
    height: BUTTON_SIZE,
  }));

  const arrowAnimationStyle = useAnimatedStyle(() => {
    if (isBackButton) {
      return { opacity: 1, transform: [{ translateX: 0 }] };
    }

    return {
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
    };
  });

  const textAnimationStyle = useAnimatedStyle(() => {
    if (isBackButton) {
      return { opacity: 0, transform: [{ translateX: -100 }] };
    }

    return {
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
    };
  });

  const gradientColors = useDerivedValue(() => {
    const backgroundColor = interpolateColor(
      x.value,
      [0, SCREEN_WIDTH, 2 * SCREEN_WIDTH],
      ['#386FE5', '#1D4ED8', '#60A5FA'],
    );

    return [backgroundColor, '#000B26'];
  });

  const handlePress = () => {
    if (isBackButton) {
      if (currentIndex > 0) {
        flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
      }
      return;
    }

    if (currentIndex < dataLength - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  if (isHidden) {
    return <View style={styles.placeholder} />;
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress} accessibilityRole="button">
      <Animated.View style={[styles.container, buttonAnimationStyle]}>
        <GradientButton
          height={BUTTON_SIZE}
          gradientColors={gradientColors}
          style={styles.gradientButton}
        >
          <Animated.View style={[styles.textWrapper, textAnimationStyle]}>
            <Typography variant="h5" style={styles.textButton}>
              Շարունակել
            </Typography>
          </Animated.View>

          <Animated.View style={[styles.arrowWrapper, arrowAnimationStyle]}>
            <Typography variant="h4" style={styles.arrow}>
              {isBackButton ? '←' : '→'}
            </Typography>
          </Animated.View>
        </GradientButton>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  container: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    borderRadius: 100,
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
