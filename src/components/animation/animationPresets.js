import * as Reanimated from 'react-native-reanimated';

/**
 * Map of preset names (PascalCase, camelCase) to Reanimated layout animation builders.
 * Built from exports that expose `presetName` (FadeIn, SlideOutLeft, etc.).
 */
export const ANIMATION_PRESETS = Object.freeze(
  Object.entries(Reanimated).reduce((presets, [exportName, value]) => {
    if (typeof value !== 'function' || !value.presetName) {
      return presets;
    }

    presets[value.presetName] = value;
    presets[exportName] = value;

    const camelCase =
      exportName.charAt(0).toLowerCase() + exportName.slice(1);
    if (camelCase !== exportName) {
      presets[camelCase] = value;
    }

    return presets;
  }, {}),
);

/** @type {readonly string[]} */
export const ANIMATION_PRESET_NAMES = Object.freeze(
  Object.keys(ANIMATION_PRESETS).filter((name) => /^[A-Z]/.test(name)),
);

/**
 * @param {string | import('react-native-reanimated').IEntryExitAnimationBuilder} preset
 * @returns {typeof import('react-native-reanimated').FadeIn | undefined}
 */
export function resolveAnimationPreset(preset) {
  if (!preset) {
    return undefined;
  }

  if (typeof preset === 'function' && preset.presetName) {
    return preset;
  }

  if (typeof preset === 'string') {
    return (
      ANIMATION_PRESETS[preset] ??
      ANIMATION_PRESETS[
        preset.charAt(0).toUpperCase() + preset.slice(1)
      ]
    );
  }

  return undefined;
}
