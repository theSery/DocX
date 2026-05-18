import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';
import LogoIcon from './icons/LogoIcon';

export default function OnboardingBackground() {
  const { width, height } = useWindowDimensions();

  // Color conversions from your HSBA values
  const startColor = '#3676E6'; // hsba(221, 76%, 90%, 1)
  const endColor = '#000B26';   // hsba(223, 100%, 15%, 1)

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
      <View style={styles.logoContainer} >
        <LogoIcon width={140} height={140} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill, // Makes it a full-screen background
  },
  logoContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    // zIndex: 10,
  },
});