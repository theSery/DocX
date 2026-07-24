import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useNavigationState } from '@react-navigation/native';

import { GlassSheen } from '../components/glass/GlassSheen';
import { GLASS } from '../components/glass/glassConfig';
import { useTheme } from '../hooks';
import { TAB_BAR_HEIGHT } from '../utils/dimensions';

const INDICATOR_HEIGHT = 55;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 180,
  mass: 0.6,
};

function getTabBarGlass(isDarkMode) {
  const base = isDarkMode ? GLASS.dark : GLASS.light;

  if (isDarkMode) {
    return {
      ...base,
      fill: 'rgba(17, 17, 29, 0.35)',
      highlight: 'rgba(255, 255, 255, 0.08)',
      sheen: [
        { offset: '0%', color: '#FFFFFF', opacity: 0.22 },
        { offset: '35%', color: '#FFFFFF', opacity: 0.06 },
        { offset: '100%', color: '#FFFFFF', opacity: 0 },
      ],
      depth: [
        { offset: '0%', color: '#000000', opacity: 0 },
        { offset: '70%', color: '#000000', opacity: 0.04 },
        { offset: '100%', color: '#000000', opacity: 0.14 },
      ],
    };
  }

  return {
    ...base,
    fill: 'rgba(255, 255, 255, 0.28)',
    highlight: 'rgba(255, 255, 255, 0.35)',
    sheen: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.55 },
      { offset: '38%', color: '#FFFFFF', opacity: 0.14 },
      { offset: '100%', color: '#FFFFFF', opacity: 0 },
    ],
    depth: [
      { offset: '0%', color: '#000000', opacity: 0 },
      { offset: '65%', color: '#000000', opacity: 0.02 },
      { offset: '100%', color: '#000000', opacity: 0.08 },
    ],
  };
}

/**
 * Decorative glass chrome for BottomTabBar `tabBarBackground`
 * (tint, sheen, rim, indicator). Blur lives in TabBarBlurBackground.
 * Never receives touches or affects navigation.
 */
export function TabBarGlassBackground() {
  const { isDarkMode } = useTheme();
  const activeIndex = useNavigationState(state => state.index);
  const tabCount = useNavigationState(state => state.routes.length);

  const [trackWidth, setTrackWidth] = useState(0);
  const itemWidth = tabCount > 0 ? trackWidth / tabCount : 0;
  const indicatorX = useSharedValue(0);

  const glass = useMemo(() => getTabBarGlass(isDarkMode), [isDarkMode]);

  useEffect(() => {
    if (itemWidth <= 0) {
      return;
    }

    indicatorX.value = withSpring(itemWidth * activeIndex, SPRING_CONFIG);
  }, [activeIndex, indicatorX, itemWidth]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    width: itemWidth,
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleLayout = useCallback(e => {
    const { width } = e.nativeEvent.layout;
    setTrackWidth(current => (width !== current ? width : current));
  }, []);

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      onLayout={handleLayout}
      style={[
        styles.root,
        {
          borderColor: glass.border,
          height: TAB_BAR_HEIGHT,
        },
      ]}>
      <View
        pointerEvents="none"
        style={[styles.tintLayer, {}]}
      />
      {/* <View
        pointerEvents="none"
        style={[styles.glassHighlight, { backgroundColor: glass.highlight }]}
      /> */}
      <GlassSheen
        stops={glass.sheen}
        gradientId="tabBarGlassSheen"
        direction="vertical"
      />
      <GlassSheen
        stops={glass.depth}
        gradientId="tabBarGlassDepth"
        direction="vertical"
      />
      <View
        pointerEvents="none"
        style={[styles.glassRim, { backgroundColor: glass.rim }]}
      />
      <Animated.Image
        pointerEvents="none"
        source={require('../assets/images/barIndicator.webp')}
        style={[
          styles.indicator,
          indicatorAnimatedStyle,
          { height: INDICATOR_HEIGHT },
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Stay at the bottom of the tab-bar stacking context (behind tab items).
  // Do not raise zIndex — high values fight react-native-screens transitions.
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
    elevation: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 20,
    // backgroundColor: 'red',
  },
  tintLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
    elevation: 0,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    zIndex: 1,
    elevation: 0,
  },
  glassRim: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: StyleSheet.hairlineWidth,
    borderRadius: 1,
    opacity: 0.85,
    zIndex: 1,
    elevation: 0,
  },
  indicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: -4,
    right: -4,
    borderRadius: 15,
    zIndex: 2,
    elevation: 0,
  },
});

/** Shared layout tokens for the floating default tab bar. */
export const TAB_BAR_LAYOUT = {
  height: TAB_BAR_HEIGHT,
  horizontalMargin: 16,
  bottomOffset: 10,
  borderRadius: 20,
};

export const tabBarFloatingStyle = {
  position: 'absolute',
  backgroundColor: 'transparent',
  borderTopWidth: 0,
  borderWidth: 0,
  elevation: 0,
  // Keep the bar chrome from winning the screen stacking context.
  zIndex: 0,
  height: TAB_BAR_LAYOUT.height,
  marginHorizontal: TAB_BAR_LAYOUT.horizontalMargin,
  borderRadius: TAB_BAR_LAYOUT.borderRadius,
  overflow: 'hidden',
  paddingBottom: 0,
  paddingHorizontal: 0,
  ...Platform.select({
    ios: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
    },
    android: {
      elevation: 0,
    },
    default: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
    },
  }),
};
