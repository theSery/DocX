import { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { buildLayoutAnimation, pickAnimationConfig } from './buildLayoutAnimation';
import { resolveAnimationPreset } from './animationPresets';

/**
 * @typedef {import('./buildLayoutAnimation').LayoutAnimationConfig} LayoutAnimationConfig
 * @typedef {import('react-native-reanimated').AnimatedProps<import('react-native').ViewProps>} AnimatedViewProps
 *
 * @typedef {AnimatedViewProps & LayoutAnimationConfig & {
 *   children?: React.ReactNode;
 *   animation?: string | import('react-native-reanimated').IEntryExitAnimationBuilder;
 *   entering?: string | import('react-native-reanimated').IEntryExitAnimationBuilder;
 *   exiting?: string | import('react-native-reanimated').IEntryExitAnimationBuilder;
 *   layout?: string | import('react-native-reanimated').ILayoutAnimationBuilder;
 *   animationConfig?: LayoutAnimationConfig;
 *   enteringConfig?: LayoutAnimationConfig;
 *   exitingConfig?: LayoutAnimationConfig;
 *   layoutConfig?: LayoutAnimationConfig;
 *   onEnterComplete?: (finished: boolean) => void;
 *   onExitComplete?: (finished: boolean) => void;
 * }} AnimatedViewComponentProps
 */

/**
 * Animated.View wrapper with layout animations controlled via props.
 *
 * @example
 * <AnimatedView entering="FadeIn" exiting="FadeOut" duration={400}>
 *   <Text>Hello</Text>
 * </AnimatedView>
 *
 * @example
 * <AnimatedView
 *   entering="SlideInRight"
 *   enteringConfig={{ duration: 500, delay: 100 }}
 *   exiting="SlideOutLeft"
 *   exitingConfig={{ duration: 300 }}
 * />
 *
 * @param {AnimatedViewComponentProps} props
 */
export function AnimatedView({
  children,
  style,
  animation,
  entering,
  exiting,
  layout,
  animationConfig,
  enteringConfig,
  exitingConfig,
  layoutConfig,
  onEnterComplete,
  onExitComplete,
  duration,
  delay,
  easing,
  springify,
  damping,
  dampingRatio,
  mass,
  stiffness,
  overshootClamping,
  energyThreshold,
  rotate,
  reduceMotion,
  randomDelay,
  withInitialValues,
  callback,
  onComplete,
  ...viewProps
}) {
  const sharedConfig = useMemo(
    () =>
      pickAnimationConfig({
        duration,
        delay,
        easing,
        springify,
        damping,
        dampingRatio,
        mass,
        stiffness,
        overshootClamping,
        energyThreshold,
        rotate,
        reduceMotion,
        randomDelay,
        withInitialValues,
        callback,
        onComplete,
        ...animationConfig,
      }),
    [
      animationConfig,
      callback,
      damping,
      dampingRatio,
      delay,
      duration,
      easing,
      energyThreshold,
      mass,
      onComplete,
      overshootClamping,
      randomDelay,
      reduceMotion,
      rotate,
      springify,
      stiffness,
      withInitialValues,
    ],
  );

  const enteringAnimation = useMemo(
    () =>
      buildLayoutAnimation(entering ?? animation, {
        ...sharedConfig,
        ...enteringConfig,
        onComplete: onEnterComplete ?? enteringConfig?.onComplete,
        callback:
          onEnterComplete ??
          enteringConfig?.callback ??
          enteringConfig?.onComplete,
      }),
    [animation, entering, enteringConfig, onEnterComplete, sharedConfig],
  );

  const exitingAnimation = useMemo(
    () =>
      buildLayoutAnimation(exiting, {
        ...sharedConfig,
        ...exitingConfig,
        onComplete: onExitComplete ?? exitingConfig?.onComplete,
        callback:
          onExitComplete ?? exitingConfig?.callback ?? exitingConfig?.onComplete,
      }),
    [exiting, exitingConfig, onExitComplete, sharedConfig],
  );

  const layoutAnimation = useMemo(() => {
    if (!layout) {
      return undefined;
    }

    if (typeof layout === 'object' && typeof layout.build === 'function') {
      return buildLayoutAnimation(layout, { ...sharedConfig, ...layoutConfig });
    }

    const LayoutClass = resolveAnimationPreset(layout);
    if (!LayoutClass) {
      if (__DEV__) {
        console.warn(`[AnimatedView] Unknown layout preset: "${layout}"`);
      }
      return undefined;
    }

    return buildLayoutAnimation(LayoutClass, { ...sharedConfig, ...layoutConfig });
  }, [layout, layoutConfig, sharedConfig]);

  return (
    <Animated.View
      style={style}
      entering={enteringAnimation}
      exiting={exitingAnimation}
      layout={layoutAnimation}
      {...viewProps}
    >
      {children}
    </Animated.View>
  );
}
