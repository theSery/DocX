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
        isCompactScreen ? compactFontSizeStyle(baseStyle) : null,
      ]}
      {...textProps}
    >
      {children}
    </Text>
  );
}

function compactFontSizeStyle(style) {
  const fontSize = StyleSheet.flatten(style)?.fontSize;

  if (typeof fontSize !== 'number') {
    return null;
  }

  return { fontSize: fontSize - SMALL_SCREEN_FONT_DELTA };
}
