import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from '../../theme/fonts';

/**
 * Canonical typography scale. Extend this object for body, caption, button, etc.
 * @type {Record<string, import('react-native').TextStyle>}
 */
export const TYPOGRAPHY_VARIANT_DEFINITIONS = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 1.6,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.8,
    fontFamily: FONT_FAMILY.semiBold,
  },
  h3: {
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: 0.8,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    fontFamily: FONT_FAMILY.bold,
  },
  h5: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    fontFamily: FONT_FAMILY.regular,
  },
  h6: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
};

/** @type {readonly (keyof typeof TYPOGRAPHY_VARIANT_DEFINITIONS)[]} */
export const TYPOGRAPHY_VARIANTS = Object.freeze(
  Object.keys(TYPOGRAPHY_VARIANT_DEFINITIONS),
);

export const DEFAULT_TYPOGRAPHY_VARIANT = 'h4';

export const typographyStyles = StyleSheet.create(
  TYPOGRAPHY_VARIANT_DEFINITIONS,
);

/**
 * @param {string | undefined} variant
 * @returns {variant is keyof typeof TYPOGRAPHY_VARIANT_DEFINITIONS}
 */
export function isTypographyVariant(variant) {
  return (
    typeof variant === 'string' &&
    Object.prototype.hasOwnProperty.call(
      TYPOGRAPHY_VARIANT_DEFINITIONS,
      variant,
    )
  );
}

/**
 * @param {string | undefined} variant
 * @returns {keyof typeof TYPOGRAPHY_VARIANT_DEFINITIONS}
 */
export function resolveTypographyVariant(variant) {
  if (isTypographyVariant(variant)) {
    return variant;
  }

  if (__DEV__ && variant != null) {
    console.warn(
      `Typography: unknown variant "${variant}". Falling back to "${DEFAULT_TYPOGRAPHY_VARIANT}". Valid variants: ${TYPOGRAPHY_VARIANTS.join(', ')}`,
    );
  }

  return DEFAULT_TYPOGRAPHY_VARIANT;
}
