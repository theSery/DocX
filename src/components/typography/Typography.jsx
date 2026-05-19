import { Text } from 'react-native';
import {
  DEFAULT_TYPOGRAPHY_VARIANT,
  resolveTypographyVariant,
  typographyStyles,
} from './typographyStyles';

const HEADER_VARIANTS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/**
 * @param {import('react-native').TextProps & {
 *   variant?: keyof typeof import('./typographyStyles').TYPOGRAPHY_VARIANT_DEFINITIONS;
 *   children?: React.ReactNode;
 * }} props
 */
export function Typography({
  variant = DEFAULT_TYPOGRAPHY_VARIANT,
  style,
  children,
  accessibilityRole,
  ...textProps
}) {
  const resolvedVariant = resolveTypographyVariant(variant);
  const resolvedAccessibilityRole =
    accessibilityRole ??
    (HEADER_VARIANTS.has(resolvedVariant) ? 'header' : undefined);

  return (
    <Text
      accessibilityRole={resolvedAccessibilityRole}
      style={[typographyStyles[resolvedVariant], style]}
      {...textProps}
    >
      {children}
    </Text>
  );
}
