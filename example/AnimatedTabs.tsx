import React from 'react';
import { useWindowDimensions, StyleSheet, View, Pressable, Text } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Animated, { 
  useSharedValue, 
  useDerivedValue, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';

export const AnimatedTabs = () => {
  const { width, height } = useWindowDimensions();
  
  // 0 = Login (Left Active), 1 = Registration (Right Active)
  const activeTab = useSharedValue(1); 

  // Your exact requested dimensions
  const tabWidth = width / 2; 
  const cornerRadius = 30; 
  const containerTop = 100; 

  const animatedPath = useDerivedValue(() => {
    const customPath = Skia.Path.Make();

    // Slide the cutout as one rigid tab-shaped window; flat edges on each side
    // grow/shrink so width, curves, and corner radii stay constant mid-animation.
    const cutoutLeft = interpolate(activeTab.value, [0, 1], [0, tabWidth]);
    const cutoutRight = cutoutLeft + tabWidth;

    // 1. Start from the bottom left of the screen
    customPath.moveTo(0, height);

    // 2. Line up to the top left corner of the white card
    customPath.lineTo(0, containerTop + cornerRadius);

    // 3. Convex curve into the top flat edge
    customPath.quadTo(0, containerTop, cornerRadius, containerTop);

    // 4. Left flat — only when cutout sits right of the left corner
    if (cutoutLeft > cornerRadius) {
      customPath.lineTo(cutoutLeft - cornerRadius, containerTop);
    }

    // 5. Left inverted curve (concave) into the tab
    customPath.quadTo(
      cutoutLeft,
      containerTop,
      cutoutLeft,
      containerTop - cornerRadius,
    );

    // 6. Tab notch left edge and top cap
    customPath.lineTo(cutoutLeft, cornerRadius);
    customPath.quadTo(cutoutLeft, 0, cutoutLeft + cornerRadius, 0);
    customPath.lineTo(cutoutRight - cornerRadius, 0);

    // 7. Tab notch right edge and inverted curve back to the card top
    customPath.quadTo(cutoutRight, 0, cutoutRight, cornerRadius);
    customPath.lineTo(cutoutRight, containerTop - cornerRadius);
    if (cutoutRight < width - cornerRadius) {
      customPath.quadTo(
        cutoutRight,
        containerTop,
        cutoutRight + cornerRadius,
        containerTop,
      );
    } else {
      customPath.quadTo(
        cutoutRight,
        containerTop,
        width - cornerRadius,
        containerTop,
      );
    }

    // 8. Right flat — only when cutout sits left of the right corner
    if (cutoutRight < width - cornerRadius) {
      customPath.lineTo(width - cornerRadius, containerTop);
    }

    // 9. Convex curve into the right edge and close the frame
    customPath.quadTo(width, containerTop, width, containerTop + cornerRadius);
    customPath.lineTo(width, height);
    customPath.close();

    return customPath;
  });

  const handleTabPress = (index: number) => {
    activeTab.value = withTiming(index, { duration: 350 });
  };

  return (
    <View style={styles.container}>
      {/* Background Canvas handling the inverted radius curve */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={animatedPath} color="white" />
      </Canvas>

      {/* Foreground Interactive Header */}
      <View style={[styles.headerContainer, { height: containerTop }]}>
        <View style={styles.buttonRow}>
          <Pressable style={styles.tabButton} onPress={() => handleTabPress(0)}>
            <Text style={[styles.buttonText, { top: cornerRadius / 2 }]}>Մուտք</Text>
          </Pressable>
          <Pressable style={styles.tabButton} onPress={() => handleTabPress(1)}>
            <Text style={[styles.buttonText, { top: cornerRadius / 2 }]}>Գրանցում</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f1f5f9', // Light background visible behind the tabs
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  buttonRow: { 
    flexDirection: 'row', 
    flex: 1,
  },
  tabButton: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  buttonText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1d3557',
  }
});
