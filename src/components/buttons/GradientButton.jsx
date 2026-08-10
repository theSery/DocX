import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';
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
  /** Bump when a parent Modal reopens so Skia mounts a fresh surface. */
  surfaceKey = 0,
}) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  // Defer Canvas mount one frame after size is known — avoids blank Skia surfaces in Modals.
  const [canvasReady, setCanvasReady] = useState(false);
  const needsLayout = width == null || height == null;
  const canvasWidth = width ?? layout.width;
  const canvasHeight = height ?? layout.height;
  const hasSize = canvasWidth > 0 && canvasHeight > 0;

  const staticColors = isLight
    ? gradientStops(gradients.lightSky)
    : gradientStops(gradients.blueLarge);
  const colors = gradientColors ?? staticColors;

  useEffect(() => {
    if (!hasSize) {
      setCanvasReady(false);
      return undefined;
    }

    setCanvasReady(false);
    const frameId = requestAnimationFrame(() => {
      setCanvasReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [hasSize, canvasWidth, canvasHeight, surfaceKey]);

  return (
    <View
      style={[styles.container, needsLayout && styles.fill, style]}
      onLayout={
        needsLayout
          ? (event) => {
              const { width: w, height: h } = event.nativeEvent.layout;
              if (w !== layout.width || h !== layout.height) {
                setLayout({ width: w, height: h });
              }
            }
          : undefined
      }
    >
      {hasSize && canvasReady ? (
        <Canvas
          key={`gradient-${surfaceKey}-${canvasWidth}x${canvasHeight}`}
          style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}
        >
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(canvasWidth, canvasHeight)}
              colors={colors}
            />
          </Rect>
        </Canvas>
      ) : null}
      <View style={[styles.content, !centered && styles.contentFill, childrenStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: 'transparent'},
  fill: {
    flex: 1,
    alignSelf: 'stretch',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
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