import React, { useId, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { gradientStops, gradients } from '../../theme/tokens';

export default function GradientButton({
  children,
  isLight = false,
  centered = true,
  style,
  width,
  height,
  childrenStyle,
  gradientColors,
  /** Kept for callers (e.g. GlobalSheet); SVG gradients don't need a remount key. */
  surfaceKey = 0,
}) {
  const reactId = useId();
  const gradientId = useMemo(
    () => `gb-${surfaceKey}-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [reactId, surfaceKey],
  );

  const needsLayout = width == null || height == null;
  const staticColors = isLight
    ? gradientStops(gradients.lightSky)
    : gradientStops(gradients.blueLarge);
  const colors = gradientColors ?? staticColors;
  // Solid fallback so the button never flashes empty if the gradient is slow.
  const fallbackColor = colors[0] ?? gradients.blueLarge.start;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: fallbackColor },
        needsLayout && styles.fill,
        width != null ? { width } : null,
        height != null ? { height } : null,
        style,
      ]}
    >
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            {colors.map((color, index) => (
              <Stop
                key={`${index}-${color}`}
                offset={
                  colors.length <= 1
                    ? '0'
                    : String(index / (colors.length - 1))
                }
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      <View
        style={[
          styles.content,
          !centered && styles.contentFill,
          childrenStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    alignSelf: 'stretch',
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
});
