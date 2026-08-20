import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Canvas, LinearGradient, vec, RoundedRect } from '@shopify/react-native-skia';
import { gradients } from '../theme/tokens';
import { HEADER_BOTTOM_RADIUS } from './gradientConstants';
import { useTheme } from '../hooks/useTheme';

export default function GradientBackground({
  children,
  isLight = false,
  centered = true,
  isReversed = false,
  gradientHeight,
  gradientWidth,
  gradientRadius,
  isAccountScreen = false,
}) {
  const { width: windowWidth, height } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const width = gradientWidth ?? windowWidth;
  const cornerRadius = gradientRadius ?? HEADER_BOTTOM_RADIUS;
  const roundAllCorners = gradientRadius != null;
  const calculateGradientHeight = () => {
    if (!gradientHeight) return height; // Если не передано, на весь экран

    if (typeof gradientHeight === 'string' && gradientHeight.endsWith('%')) {
      const percentage = parseFloat(gradientHeight) / 100;
      return height * percentage; // Высчитываем процент от высоты экрана
    }

    return Number(gradientHeight); // Если передано число или числовая строка
  };
  const finalGradientHeight = calculateGradientHeight();
  const corner = { x: cornerRadius, y: cornerRadius };
  const roundedRect = {
    rect: { x: 0, y: 0, width, height: finalGradientHeight },
    topLeft: roundAllCorners ? corner : { x: 0, y: 0 },
    topRight: roundAllCorners ? corner : { x: 0, y: 0 },
    bottomRight: corner,
    bottomLeft: corner,
  };

  const isAccountDark = isAccountScreen && isDarkMode;
  const gradient = isAccountScreen
    ? isDarkMode
      ? gradients.accountStackDark
      : gradients.accountStack
    : isLight
      ? gradients.lightSky
      : gradients.blueLarge;
  const startColor = gradient.start;
  const endColor = gradient.end;
  const gradientEnd = isAccountDark
    ? vec(0, finalGradientHeight)
    : vec(width, gradientWidth != null || isAccountScreen ? finalGradientHeight : height);

  return (
    <View style={styles.container}>
      <Canvas       
       style={
        [styles.gradient, {
          width,
          height: finalGradientHeight,
          ...(roundAllCorners
            ? { borderRadius: cornerRadius }
            : {
                borderBottomLeftRadius: cornerRadius,
                borderBottomRightRadius: cornerRadius,
              }),
        }]
        }>
        <RoundedRect rect={roundedRect}  >
          <LinearGradient
            start={vec(0, 0)}
            end={gradientEnd}
            colors={!isReversed ? [startColor, endColor] : [endColor, startColor]}
          />
        </RoundedRect>
      </Canvas>
      <View style={[styles.content, !centered && styles.contentFill]}>
        {children}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill, // Makes it a full-screen background
  },
  content: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentFill: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  gradient: {

    borderBottomLeftRadius: HEADER_BOTTOM_RADIUS,
    borderBottomRightRadius: HEADER_BOTTOM_RADIUS,
    overflow: 'hidden',
  },
});

