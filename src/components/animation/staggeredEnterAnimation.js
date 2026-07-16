/**
 * Shared staggered list-enter animation used across category, document,
 * and accordion item lists.
 */
export const STAGGERED_ENTER = {
  animation: 'fadeInLeft',
  duration: 300,
  stagger: 100,
};

/**
 * @param {number} [index=0]
 * @param {{ duration?: number; stagger?: number }} [options]
 * @returns {{ duration: number; delay: number }}
 */
export function getStaggeredEnterConfig(
  index = 0,
  { duration = STAGGERED_ENTER.duration, stagger = STAGGERED_ENTER.stagger } = {},
) {
  return {
    duration,
    delay: index * stagger,
  };
}

/**
 * Props ready to spread onto `AnimatedView`.
 *
 * @param {number} [index=0]
 * @param {{ duration?: number; stagger?: number; animation?: string }} [options]
 * @returns {{
 *   animation: string;
 *   animationConfig: { duration: number; delay: number };
 * }}
 */
export function getStaggeredEnterProps(
  index = 0,
  {
    duration = STAGGERED_ENTER.duration,
    stagger = STAGGERED_ENTER.stagger,
    animation = STAGGERED_ENTER.animation,
  } = {},
) {
  return {
    animation,
    animationConfig: getStaggeredEnterConfig(index, { duration, stagger }),
  };
}
