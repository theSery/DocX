import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { AUTH_SCREEN_HORIZONTAL_PADDING } from '../../../components/layout/authLayoutConstants';
import { FONT_FAMILY, palette } from '../../../theme';

const CORNER_RADIUS = 30;
const CONTAINER_TOP = 60;
const TAB_TIMING = { duration: 350 };

function TabLabel({ activeTab, index, label }) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeTab.value,
      [0, 1],
      index === 0
        ? [palette.mainBlue, palette.white]
        : [palette.white, palette.mainBlue],
    ),
    top: CORNER_RADIUS / 2,
  }));

  return (
    <Animated.Text style={[styles.buttonText, animatedStyle]}>
      {label}
    </Animated.Text>
  );
}

export function AnimatedTabs() {
  const activeTab = useSharedValue(1);
  const layoutWidth = useSharedValue(0);
  const layoutHeight = useSharedValue(0);

  const animatedPath = useDerivedValue(() => {
    const width = layoutWidth.value;
    const height = layoutHeight.value;

    if (width <= 0 || height <= 0) {
      return Skia.Path.Make();
    }

    const customPath = Skia.Path.Make();
    const tabWidth = width / 2;

    const cutoutLeft = interpolate(activeTab.value, [0, 1], [0, tabWidth]);
    const cutoutRight = cutoutLeft + tabWidth;
    const leftRadius = interpolate(activeTab.value, [0, 1], [0, CORNER_RADIUS]);
    const rightRadius = interpolate(
      activeTab.value,
      [0, 1],
      [CORNER_RADIUS, 0],
    );

    customPath.moveTo(0, height);
    customPath.lineTo(0, CONTAINER_TOP + leftRadius);
    customPath.quadTo(0, CONTAINER_TOP, leftRadius, CONTAINER_TOP);

    if (cutoutLeft > leftRadius) {
      customPath.lineTo(cutoutLeft - leftRadius, CONTAINER_TOP);
    }

    customPath.quadTo(
      cutoutLeft,
      CONTAINER_TOP,
      cutoutLeft,
      CONTAINER_TOP - leftRadius,
    );

    customPath.lineTo(cutoutLeft, CORNER_RADIUS);
    customPath.quadTo(cutoutLeft, 0, cutoutLeft + CORNER_RADIUS, 0);
    customPath.lineTo(cutoutRight - CORNER_RADIUS, 0);

    customPath.quadTo(cutoutRight, 0, cutoutRight, CORNER_RADIUS);
    customPath.lineTo(cutoutRight, CONTAINER_TOP - CORNER_RADIUS);

    if (cutoutRight < width - rightRadius) {
      customPath.quadTo(
        cutoutRight,
        CONTAINER_TOP,
        cutoutRight + CORNER_RADIUS,
        CONTAINER_TOP,
      );
    } else {
      customPath.quadTo(
        cutoutRight,
        CONTAINER_TOP,
        width - rightRadius,
        CONTAINER_TOP,
      );
    }

    if (cutoutRight < width - rightRadius) {
      customPath.lineTo(width - rightRadius, CONTAINER_TOP);
    }

    customPath.quadTo(width, CONTAINER_TOP, width, CONTAINER_TOP + rightRadius);
    customPath.lineTo(width, height);
    customPath.close();

    return customPath;
  });

  const handleTabPress = index => {
    activeTab.value = withTiming(index, TAB_TIMING);
  };

  const onLayout = useCallback(
    event => {
      const { width, height } = event.nativeEvent.layout;
      layoutWidth.value = width;
      layoutHeight.value = height;
    },
    [layoutWidth, layoutHeight],
  );

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={animatedPath} color="white" />
      </Canvas>

      <View style={[styles.headerContainer, { height: CONTAINER_TOP }]}>
        <View style={styles.buttonRow}>
          <Pressable style={styles.tabButton} onPress={() => handleTabPress(0)}>
            <TabLabel activeTab={activeTab} index={0} label="Մուտք" />
          </Pressable>
          <Pressable style={styles.tabButton} onPress={() => handleTabPress(1)}>
            <TabLabel activeTab={activeTab} index={1} label="Գրանցում" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: -AUTH_SCREEN_HORIZONTAL_PADDING,
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
    fontSize: 14,
    fontFamily: FONT_FAMILY.regular,
    letterSpacing: 2,
    marginBottom: 20,
  },
});
