import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Canvas, Rect, LinearGradient, vec, RoundedRect } from '@shopify/react-native-skia';
import { gradients } from '../theme/tokens';


const BOTTOM_RADIUS = 30;
export default function GradientBackground({
  children,
  isLight = false,
  centered = true,
  isReversed = false,
  gradientHeight,
  gradientRadius,
}) {
  const { width, height } = useWindowDimensions();
  const calculateGradientHeight = () => {
    if (!gradientHeight) return height; // Если не передано, на весь экран

    if (typeof gradientHeight === 'string' && gradientHeight.endsWith('%')) {
      const percentage = parseFloat(gradientHeight) / 100;
      return height * percentage; // Высчитываем процент от высоты экрана
    }

    return Number(gradientHeight); // Если передано число или числовая строка
  };
  const finalGradientHeight = calculateGradientHeight();
  const roundedRect = {
    rect: { x: 0, y: 0, width, height: finalGradientHeight },
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomRight: { x: BOTTOM_RADIUS, y: BOTTOM_RADIUS },
    bottomLeft: { x: BOTTOM_RADIUS, y: BOTTOM_RADIUS },
  };

  const gradient = isLight ? gradients.lightSky : gradients.blueLarge;
  const startColor = gradient.start;
  const endColor = gradient.end;

  return (
    <View style={styles.container}>
      <Canvas       
       style={
        [styles.gradient, {    width,
        height: finalGradientHeight}]
        }>
        <RoundedRect rect={roundedRect}  >
          <LinearGradient
            start={vec(0, 0)} 
            end={vec(width, height)} 
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

    borderBottomLeftRadius: BOTTOM_RADIUS,
    borderBottomRightRadius: BOTTOM_RADIUS,
    overflow: 'hidden',
  },
});
// import React from 'react';
// import { StyleSheet, useWindowDimensions, View } from 'react-native';
// import { Canvas, RoundedRect, LinearGradient, vec } from '@shopify/react-native-skia';

// const GRADIENT_HEIGHT = 200;
// const BOTTOM_RADIUS = 50;


// export default function GradientBackground({
//   children,
//   isLight = false,
//   centered = true,
//   isReversed = false,
//   gradientHeight = GRADIENT_HEIGHT,
// }) {
//   const { width, height } = useWindowDimensions();

//   const roundedRect = {
//     rect: { x: 0, y: 0, width, height: height },
//     topLeft: { x: 0, y: 0 },
//     topRight: { x: 0, y: 0 },
//     bottomRight: { x: BOTTOM_RADIUS, y: BOTTOM_RADIUS },
//     bottomLeft: { x: BOTTOM_RADIUS, y: BOTTOM_RADIUS },
//   };

//   // Color conversions from your HSBA values
//   const startColor = isLight ? '#FFFFFF' : '#386FE5'; // hsba(221, 76%, 90%, 1)
//   const endColor = isLight ? '#CFF1FF' : '#000B26';   // hsba(223, 100%, 15%, 1)

//   return (
//     <View style={styles.container}>
//       <Canvas
//         style={{
//           width,
//           height: height,
//           borderBottomLeftRadius: BOTTOM_RADIUS,
//           borderBottomRightRadius: BOTTOM_RADIUS,
//           overflow: 'hidden',
//         }}>
//         <RoundedRect rect={roundedRect}>
//           <LinearGradient
//             start={vec(0, 0)}
//             end={vec(width, GRADIENT_HEIGHT)}
//             colors={!isReversed ? [startColor, endColor] : [endColor, startColor]}
//           />
//         </RoundedRect>
//       </Canvas>
//       <View style={[styles.content, !centered && styles.contentFill]}>
//         {children}
//       </View>

//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFill, // Makes it a full-screen background
//   },
//   content: {
//     ...StyleSheet.absoluteFill,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   contentFill: {
//     justifyContent: 'flex-start',
//     alignItems: 'stretch',
//   },
// });
