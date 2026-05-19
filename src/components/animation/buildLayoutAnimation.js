import { resolveAnimationPreset } from './animationPresets';

/**
 * @typedef {import('react-native-reanimated').ReduceMotion} ReduceMotion
 * @typedef {import('react-native-reanimated').StyleProps} StyleProps
 *
 * @typedef {Object} LayoutAnimationConfig
 * @property {number} [duration]
 * @property {number} [delay]
 * @property {import('react-native-reanimated').EasingFunction | import('react-native-reanimated').EasingFunctionFactory} [easing]
 * @property {boolean | number} [springify]
 * @property {number} [damping]
 * @property {number} [dampingRatio]
 * @property {number} [mass]
 * @property {number} [stiffness]
 * @property {number} [overshootClamping]
 * @property {number} [energyThreshold]
 * @property {string} [rotate]
 * @property {ReduceMotion} [reduceMotion]
 * @property {boolean} [randomDelay]
 * @property {StyleProps} [withInitialValues]
 * @property {(finished: boolean) => void} [callback]
 * @property {(finished: boolean) => void} [onComplete]
 */

const ANIMATION_CONFIG_KEYS = [
  'duration',
  'delay',
  'easing',
  'springify',
  'damping',
  'dampingRatio',
  'mass',
  'stiffness',
  'overshootClamping',
  'energyThreshold',
  'rotate',
  'reduceMotion',
  'randomDelay',
  'withInitialValues',
  'callback',
  'onComplete',
];

/**
 * @param {Record<string, unknown>} props
 * @returns {LayoutAnimationConfig}
 */
export function pickAnimationConfig(props) {
  return ANIMATION_CONFIG_KEYS.reduce((config, key) => {
    if (props[key] !== undefined) {
      config[key] = props[key];
    }
    return config;
  }, {});
}

/**
 * @param {import('react-native-reanimated').IEntryExitAnimationBuilder} builder
 * @param {LayoutAnimationConfig} config
 */
function applyAnimationConfig(builder, config) {
  let animation = builder;

  if (config.springify != null && config.springify !== false) {
    animation = animation.springify(
      typeof config.springify === 'number' ? config.springify : undefined,
    );
  }
  if (config.duration != null) {
    animation = animation.duration(config.duration);
  }
  if (config.delay != null) {
    animation = animation.delay(config.delay);
  }
  if (config.easing != null) {
    animation = animation.easing(config.easing);
  }
  if (config.damping != null) {
    animation = animation.damping(config.damping);
  }
  if (config.dampingRatio != null) {
    animation = animation.dampingRatio(config.dampingRatio);
  }
  if (config.mass != null) {
    animation = animation.mass(config.mass);
  }
  if (config.stiffness != null) {
    animation = animation.stiffness(config.stiffness);
  }
  if (config.overshootClamping != null) {
    animation = animation.overshootClamping(config.overshootClamping);
  }
  if (config.energyThreshold != null) {
    animation = animation.energyThreshold(config.energyThreshold);
  }
  if (config.rotate != null) {
    animation = animation.rotate(config.rotate);
  }
  if (config.reduceMotion != null) {
    animation = animation.reduceMotion(config.reduceMotion);
  }
  if (config.randomDelay) {
    animation = animation.randomDelay();
  }
  if (config.withInitialValues != null) {
    animation = animation.withInitialValues(config.withInitialValues);
  }

  const completionCallback = config.onComplete ?? config.callback;
  if (completionCallback != null) {
    animation = animation.withCallback(completionCallback);
  }

  return animation;
}

/**
 * @param {string | import('react-native-reanimated').IEntryExitAnimationBuilder | undefined} preset
 * @param {LayoutAnimationConfig} [config]
 * @returns {import('react-native-reanimated').IEntryExitAnimationBuilder | undefined}
 */
export function buildLayoutAnimation(preset, config = {}) {
  if (!preset) {
    return undefined;
  }

  if (typeof preset === 'object' && typeof preset.build === 'function') {
    return applyAnimationConfig(preset, config);
  }

  const AnimationClass = resolveAnimationPreset(preset);
  if (!AnimationClass) {
    if (__DEV__) {
      console.warn(`[AnimatedView] Unknown animation preset: "${preset}"`);
    }
    return undefined;
  }

  return applyAnimationConfig(AnimationClass, config);
}
