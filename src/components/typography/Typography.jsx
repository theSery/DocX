import { StyleSheet, Text } from 'react-native';
import { useIsCompactScreen } from '../../hooks/useResponsiveLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  DEFAULT_TYPOGRAPHY_VARIANT,
  resolveTypographyVariant,
  typographyStyles,
} from './typographyStyles';

const HEADER_VARIANTS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const SMALL_SCREEN_FONT_DELTA = 2;
const SMALL_SCREEN_LETTER_SPACING_DELTA = 0.3;

/**
 * @param {import('react-native').TextProps & {
 *   variant?: keyof typeof import('./typographyStyles').TYPOGRAPHY_VARIANT_DEFINITIONS;
 *   tone?: 'default' | 'secondary' | 'disabled' | 'onDark' | 'error' | 'success' | 'tag' | 'skyBlue';
 *   children?: React.ReactNode;
 * }} props
 */
const TONE_COLOR_KEY = {
  default: 'text',
  secondary: 'textSecondary',
  disabled: 'textDisabled',
  onDark: 'textOnDark',
  error: 'error',
  success: 'success',
  tag: 'tag',
  skyBlue: 'skyBlue',
};

export function Typography({
  variant = DEFAULT_TYPOGRAPHY_VARIANT,
  tone = 'default',
  style,
  children,
  accessibilityRole,
  scaleOnCompact = true,
  ...textProps
}) {
  const { colors } = useTheme();
  const isCompactScreen = useIsCompactScreen();
  const resolvedVariant = resolveTypographyVariant(variant);
  const resolvedAccessibilityRole =
    accessibilityRole ??
    (HEADER_VARIANTS.has(resolvedVariant) ? 'header' : undefined);
  const colorKey = TONE_COLOR_KEY[tone] ?? 'text';
  const baseStyle = [typographyStyles[resolvedVariant], { color: colors[colorKey] }, style];

  return (
    <Text
      accessibilityRole={resolvedAccessibilityRole}
      style={[
        baseStyle,
        isCompactScreen && scaleOnCompact ? compactFontSizeStyle(baseStyle) : null,
      ]}
      {...textProps}
    >
      {children}
    </Text>
  );
}

function compactFontSizeStyle(style) {
  const flattened = StyleSheet.flatten(style);
  const compactStyle = {};

  if (typeof flattened?.fontSize === 'number') {
    compactStyle.fontSize = flattened.fontSize - SMALL_SCREEN_FONT_DELTA;
  }

  if (typeof flattened?.letterSpacing === 'number') {
    compactStyle.letterSpacing =
      flattened.letterSpacing - SMALL_SCREEN_LETTER_SPACING_DELTA;
  }

  return Object.keys(compactStyle).length ? compactStyle : null;
}
