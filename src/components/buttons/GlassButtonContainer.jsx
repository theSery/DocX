import { Pressable, StyleSheet, View } from 'react-native';

import { GlassSurface } from '../glass/GlassSurface';
import { BLUE_GLASS_BUTTON } from '../glass/glassConfig';
import { colors, palette } from '../../theme';

const blueShadow = BLUE_GLASS_BUTTON.shadow;

export function GlassButtonContainer({
  children,
  onPress,
  height = 44,
  width,
  backgroundColor = colors.background,
  variant = 'default',
  style,
  ...pressableProps
}) {
  const buttonWidth = width ?? height;
  const borderRadius = height / 2;
  const isBlueVariant = variant === 'blue';
  const blueColor =
    isBlueVariant && backgroundColor !== colors.background
      ? backgroundColor
      : undefined;
  const resolvedBackgroundColor = isBlueVariant
    ? blueColor ?? palette.blueLargeEnd
    : backgroundColor;
  const hasColoredBackground =
    isBlueVariant || backgroundColor !== colors.background;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pressable,
        isBlueVariant && styles.bluePressable,
        {
          width: buttonWidth,
          height,
          borderRadius,
          backgroundColor: resolvedBackgroundColor,
        },
        style,
      ]}
      {...pressableProps}>
      <GlassSurface
        gradientId="glassButtonSheen"
        borderRadius={borderRadius}
        style={styles.surface}
        variant={variant}
        blueColor={blueColor}
        showBlur={!hasColoredBackground}
        showTint={!hasColoredBackground}
      />
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  bluePressable: {
    backgroundColor: palette.blueLargeEnd,
    shadowColor: blueShadow.color,
    shadowOffset: blueShadow.offset,
    shadowOpacity: blueShadow.opacity,
    shadowRadius: blueShadow.radius,
    elevation: 6,
  },
  surface: {
    ...StyleSheet.absoluteFill,
    shadowOpacity: 0,
    elevation: 0,
  
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
