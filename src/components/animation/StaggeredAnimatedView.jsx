import { AnimatedView } from './AnimatedView';
import { getStaggeredEnterProps } from './staggeredEnterAnimation';

/**
 * Animated.View with the shared staggered list-enter animation.
 *
 * @param {{
 *   index?: number;
 *   duration?: number;
 *   stagger?: number;
 *   animation?: string;
 *   children?: React.ReactNode;
 * } & import('react-native').ViewProps} props
 */
export function StaggeredAnimatedView({
  index = 0,
  duration,
  stagger,
  animation,
  children,
  ...viewProps
}) {
  return (
    <AnimatedView
      {...getStaggeredEnterProps(index, { duration, stagger, animation })}
      {...viewProps}
    >
      {children}
    </AnimatedView>
  );
}
