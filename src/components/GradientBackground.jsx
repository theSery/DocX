import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';


export default function GradientBackground({ children, isLight = false }) {
  const { width, height } = useWindowDimensions();

  // Color conversions from your HSBA values
  const startColor = isLight ? '#FFFFFF' : '#386FE5'; // hsba(221, 76%, 90%, 1)
  const endColor = isLight ? '#CFF1FF' : '#000B26';   // hsba(223, 100%, 15%, 1)

  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)} 
            end={vec(width, height)} 
            colors={[startColor, endColor]}
          />
        </Rect>
      </Canvas>
      <View style={styles.content}>
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
});