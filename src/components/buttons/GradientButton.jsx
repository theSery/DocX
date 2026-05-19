import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';

export default function GradientButton({
  children,
  isLight = false,
  centered = true,
  style,
  width,
  height,
  childrenStyle,
  gradientColors,
}) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const needsLayout = width == null || height == null;
  const canvasWidth = width ?? layout.width;
  const canvasHeight = height ?? layout.height;

  const startColor = isLight ? '#FFFFFF' : '#386FE5';
  const endColor = isLight ? '#CFF1FF' : '#000B26';
  const staticColors = [startColor, endColor];
  const colors = gradientColors ?? staticColors;

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
      {canvasWidth > 0 && canvasHeight > 0 && (
        <Canvas style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(canvasWidth, canvasHeight)}
              colors={colors}
            />
          </Rect>
        </Canvas>
      )}
      <View style={[styles.content, !centered && styles.contentFill, childrenStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
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