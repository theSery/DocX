import { useId, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { gradients } from '../theme/tokens';
import { HEADER_BOTTOM_RADIUS } from './gradientConstants';
import { useTheme } from '../hooks/useTheme';

/**
 * SVG gradient so circular theme snapshots include this view.
 * Nested Skia canvases are skipped by makeImageFromView and paint above the overlay.
 */
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
  const reactId = useId();
  const gradientId = useMemo(
    () => `grad-bg-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [reactId],
  );

  const width = gradientWidth ?? windowWidth;
  const cornerRadius = gradientRadius ?? HEADER_BOTTOM_RADIUS;
  const roundAllCorners = gradientRadius != null;
  const calculateGradientHeight = () => {
    if (!gradientHeight) return height;

    if (typeof gradientHeight === 'string' && gradientHeight.endsWith('%')) {
      const percentage = parseFloat(gradientHeight) / 100;
      return height * percentage;
    }

    return Number(gradientHeight);
  };
  const finalGradientHeight = calculateGradientHeight();

  const isAccountDark = isAccountScreen && isDarkMode;
  const gradient = isAccountScreen
    ? isDarkMode
      ? gradients.accountStackDark
      : gradients.accountStack
    : isLight
      ? gradients.lightSky
      : gradients.blueLarge;
  const startColor = isReversed ? gradient.end : gradient.start;
  const endColor = isReversed ? gradient.start : gradient.end;
  const gradientEndX = isAccountDark ? 0 : width;
  const gradientEndY = isAccountDark
    ? finalGradientHeight
    : gradientWidth != null || isAccountScreen
      ? finalGradientHeight
      : height;

  return (
    <View style={styles.container}>
      <View
        collapsable={false}
        style={[
          styles.gradient,
          {
            width,
            height: finalGradientHeight,
            backgroundColor: startColor,
            ...(roundAllCorners
              ? { borderRadius: cornerRadius }
              : {
                  borderBottomLeftRadius: cornerRadius,
                  borderBottomRightRadius: cornerRadius,
                }),
          },
        ]}
      >
        <Svg width={width} height={finalGradientHeight} pointerEvents="none">
          <Defs>
            <LinearGradient
              id={gradientId}
              x1={0}
              y1={0}
              x2={gradientEndX}
              y2={gradientEndY}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={startColor} />
              <Stop offset="1" stopColor={endColor} />
            </LinearGradient>
          </Defs>
          <Rect width={width} height={finalGradientHeight} fill={`url(#${gradientId})`} />
        </Svg>
      </View>
      <View style={[styles.content, !centered && styles.contentFill]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
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
