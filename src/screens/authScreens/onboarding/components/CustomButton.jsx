import {
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { Typography } from '../../../../components/typography';
import GradientButton from '../../../../components/buttons/GradientButton';
import Chevron from '../../../../components/icons/Chevron';
import { gradientStops, gradients, palette } from '../../../../theme';

const BUTTON_SIZE = 44;
const EXPANDED_WIDTH = 140;
const GRADIENT_FALLBACK = gradients.blueLarge.start;
const BACK_FADE_END = 0.3;
const BACK_ZONE_EXIT = 0.4;

function smoothstep(t) {
  'worklet';
  return t * t * (3 - 2 * t);
}

export function CustomButton({
  flatListRef,
  dataLength,
  x,
  onComplete,
  currentIndex,
  isBackButton = false,
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const gradientWidth = isBackButton ? BUTTON_SIZE : EXPANDED_WIDTH;

  const expandProgress = useDerivedValue(() => {
    if (isBackButton || dataLength <= 1) {
      return 0;
    }

    const lastSlideStart = (dataLength - 2) * SCREEN_WIDTH;
    const lastSlideEnd = (dataLength - 1) * SCREEN_WIDTH;

    if (x.value < lastSlideStart) {
      return 0;
    }

    const raw = interpolate(
      x.value,
      [lastSlideStart, lastSlideEnd],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return smoothstep(raw);
  });

  const backVisibility = useDerivedValue(() => {
    if (!isBackButton) {
      return 1;
    }

    if (x.value > SCREEN_WIDTH * BACK_ZONE_EXIT) {
      return 1;
    }

    const raw = interpolate(
      x.value,
      [0, SCREEN_WIDTH * BACK_FADE_END],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return smoothstep(raw);
  });

  const buttonAnimationStyle = useAnimatedStyle(() => {
    if (isBackButton) {
      return {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
      };
    }

    const progress = expandProgress.value;

    return {
      width: interpolate(progress, [0, 1], [BUTTON_SIZE, EXPANDED_WIDTH]),
      height: BUTTON_SIZE,
    };
  });

  const backButtonWrapperStyle = useAnimatedStyle(() => {
    const visibility = backVisibility.value;

    return {
      opacity: visibility,
      transform: [
        {
          translateX: interpolate(visibility, [0, 1], [-BUTTON_SIZE * 0.55, 0]),
        },
        {
          scale: interpolate(visibility, [0, 1], [0.7, 1]),
        },
      ],
    };
  });

  const arrowAnimationStyle = useAnimatedStyle(() => {
    if (isBackButton) {
      return {
        opacity: 1,
        transform: [{ translateX: 0 }, { scale: 1 }],
      };
    }

    const progress = expandProgress.value;
    const opacity = interpolate(
      progress,
      [0, 0.38, 0.52],
      [1, 1, 0],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(progress, [0, 0.52], [1, 0.82], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [
        {
          translateX: interpolate(progress, [0, 0.52], [0, 10]),
        },
        { scale },
      ],
    };
  });

  const textAnimationStyle = useAnimatedStyle(() => {
    if (isBackButton) {
      return {
        opacity: 0,
        transform: [{ translateX: 8 }, { scale: 0.82 }],
      };
    }

    const progress = expandProgress.value;
    const opacity = interpolate(
      progress,
      [0.48, 0.62, 1],
      [0, 0, 1],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(progress, [0.48, 1], [0.82, 1], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [
        {
          translateX: interpolate(progress, [0.48, 1], [-10, 0]),
        },
        { scale },
      ],
    };
  });


  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handlePress = () => {
    if (isBackButton) {
      if (currentIndex > 0) {
        scrollToIndex(currentIndex - 1);
      }
      return;
    }

    if (currentIndex < dataLength - 1) {
      scrollToIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const buttonContent = (
    <TouchableWithoutFeedback
      onPress={handlePress}
      disabled={isBackButton && currentIndex === 0}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.container,
          isBackButton && styles.backButtonContainer,
          buttonAnimationStyle,
        ]}
      >
        <GradientButton
          width={gradientWidth}
          height={BUTTON_SIZE}
          isLight={isBackButton}
          
          gradientColors={
            isBackButton
              ? [palette.white, palette.white]
              : gradientStops(gradients.blueMain)
          }
          style={styles.gradientButton}
          childrenStyle={styles.gradientContent}
        >
          <Animated.View
            style={[styles.labelLayer, textAnimationStyle]}
            pointerEvents="none"
          >
            <Typography variant="h5" style={styles.textButton}>
              Շարունակել
            </Typography>
          </Animated.View>

          <Animated.View
            style={[styles.labelLayer, arrowAnimationStyle]}
            pointerEvents="none"
          >
            <Chevron
              width={18}
              height={18}
              fill={isBackButton ? palette.mainBlue : palette.white}
              rotate={isBackButton ? 180 : 0}
            />
          </Animated.View>
        </GradientButton>
      </Animated.View>
    </TouchableWithoutFeedback>
  );

  if (isBackButton) {
    return (
      <Animated.View
        style={[styles.backButtonOuter, backButtonWrapperStyle]}
        pointerEvents={currentIndex === 0 ? 'none' : 'auto'}
      >
        {buttonContent}
      </Animated.View>
    );
  }

  return buttonContent;
}

const styles = StyleSheet.create({
  backButtonSlot: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonOuter: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    borderRadius: BUTTON_SIZE / 2,
    overflow: 'hidden',
  },
  backButtonContainer: {
    backgroundColor: palette.white,
  },
  container: {
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: GRADIENT_FALLBACK,
  },
  gradientButton: {
    borderRadius: 100,
    // backgroundColor: 'blue',
    height: '100%',
    width: '100%',  
    overflow: 'hidden',
  },
  gradientContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  textButton: {
    color: palette.white,
  },
});
