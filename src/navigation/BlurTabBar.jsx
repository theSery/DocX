import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PlatformPressable } from '@react-navigation/elements';
import {
  CommonActions,
  NavigationProvider,
  useLinkBuilder,
} from '@react-navigation/native';

import { GlassSheen } from '../components/glass/GlassSheen';
import { GLASS } from '../components/glass/glassConfig';
import { useTheme, useAuthSession } from '../hooks';
import { Typography } from '../components/typography';
import DocumentsSvg from '../components/icons/DocumentsSvg';
import UserSvg from '../components/icons/UserSvg';
import HomeSvg from '../components/icons/HomeSvg';
import FilesSvg from '../components/icons/FilesSvg';
import { FONT_FAMILY, palette } from '../theme';
import { TAB_BAR_HEIGHT } from '../utils/dimensions';
import { PUBLIC_TAB_ROUTE_NAMES } from './tabConstants';

const HORIZONTAL_MARGIN = 16;
const BOTTOM_OFFSET = 10;
const INDICATOR_HEIGHT = 55;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 180,
  mass: 0.6,
};

const ROUTE_ICONS = {
  Home: HomeSvg,
  Documents: DocumentsSvg,
  Files: FilesSvg,
  Account: UserSvg,
};

/**
 * Simulated glass (safe): translucent fill + sheen + rim.
 * No native BlurView — that breaks nested react-native-screens pushes.
 */
function getTabBarGlass(isDarkMode) {
  const base = isDarkMode ? GLASS.dark : GLASS.light;

  if (isDarkMode) {
    return {
      ...base,
      fill: 'rgba(17, 17, 29, 0.5)',
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
      containerBackground: 'transparent',
    };
  }

  return {
    ...base,
    fill: 'rgba(255, 255, 255, 0.5)',
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
    containerBackground: 'transparent',
  };
}

function TabBarBackground({ glass }) {
  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={StyleSheet.absoluteFill}>
      {/* Base translucent plate */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: glass.fill }]}
      />
      {/* Top light reflection */}
      <View style={[styles.glassHighlight, { backgroundColor: glass.highlight }]} />
      {/* Vertical glass sheen */}
      <GlassSheen
        stops={glass.sheen}
        gradientId="tabBarGlassSheen"
        direction="vertical"
      />
      {/* Soft bottom depth */}
      <GlassSheen
        stops={glass.depth}
        gradientId="tabBarGlassDepth"
        direction="vertical"
      />
      {/* Top rim highlight */}
      <View style={[styles.glassRim, { backgroundColor: glass.rim }]} />
    </View>
  );
}

function TabItem({
  route,
  descriptor,
  isFocused,
  href,
  onPress,
  onLongPress,
  activeColor,
  inactiveColor,
}) {
  const Icon = ROUTE_ICONS[route.name];
  const { options } = descriptor;
  const label =
    typeof options.tabBarLabel === 'string'
      ? options.tabBarLabel
      : options.title ?? route.name;

  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
  }, [isFocused, progress]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.08 }],
    opacity: 0.7 + progress.value * 0.3,
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + progress.value * 0.4,
  }));

  const accessibilityLabel =
    options.tabBarAccessibilityLabel !== undefined
      ? options.tabBarAccessibilityLabel
      : Platform.OS === 'ios' && typeof label === 'string'
        ? `${label}, tab`
        : undefined;

  return (
    <PlatformPressable
      href={href}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      pressOpacity={1}
      pressColor="transparent"
      android_ripple={{ color: 'transparent' }}
      style={styles.tabItem}>
      <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
        {Icon ? (
          <Icon
            width={23}
            height={23}
            fill={isFocused ? activeColor : inactiveColor}
          />
        ) : null}
      </Animated.View>
      <Animated.View style={labelAnimatedStyle}>
        <Typography
          variant="h6"
          numberOfLines={1}
          style={[
            styles.label,
            { color: isFocused ? activeColor : inactiveColor },
          ]}>
          {label}
        </Typography>
      </Animated.View>
    </PlatformPressable>
  );
}

/**
 * Custom glass tab bar whose navigation behavior mirrors
 * `@react-navigation/bottom-tabs` BottomTabBar exactly.
 */
export function BlurTabBar({ state, descriptors, navigation, insets }) {
  const { colors, isDarkMode } = useTheme();
  const { buildHref } = useLinkBuilder();
  const { isAuthenticated, openAuth } = useAuthSession();

  const tabCount = state.routes.length;
  const [trackWidth, setTrackWidth] = useState(0);
  const itemWidth = tabCount > 0 ? trackWidth / tabCount : 0;

  const indicatorX = useSharedValue(0);

  const glass = useMemo(() => getTabBarGlass(isDarkMode), [isDarkMode]);
  const activeColor = palette.mainWhite;
  const inactiveColor = isDarkMode ? colors.textSecondary : colors.text;
  const bottomInset = Math.max((insets?.bottom ?? 0) - BOTTOM_OFFSET, 0);

  useEffect(() => {
    if (itemWidth <= 0) {
      return;
    }

    indicatorX.value = withSpring(itemWidth * state.index, SPRING_CONFIG);
  }, [indicatorX, itemWidth, state.index]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    width: itemWidth,
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleTrackLayout = useCallback(e => {
    const { width } = e.nativeEvent.layout;
    setTrackWidth(current => (width !== current ? width : current));
  }, []);

  return (
    <View
      pointerEvents="box-none"
      collapsable={false}
      style={[styles.host, { paddingBottom: bottomInset }]}>
      <View
        onLayout={handleTrackLayout}
        collapsable={false}
        style={[
          styles.container,
          {
            borderColor: glass.border,
            backgroundColor: glass.containerBackground,
            shadowColor: colors.shadow,
          },
        ]}>
        <TabBarBackground glass={glass} />
        <Animated.Image
          source={require('../assets/images/barIndicator.webp')}
          style={[
            styles.indicator,
            indicatorAnimatedStyle,
            { height: INDICATOR_HEIGHT },
          ]}
          resizeMode="cover"
        />
        <View style={styles.row} accessibilityRole="tablist">
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            const isFocused = state.index === index;

            // Mirror @react-navigation/bottom-tabs BottomTabBar onPress exactly.
            const onPress = () => {
              if (
                !isAuthenticated &&
                !PUBLIC_TAB_ROUTE_NAMES.includes(route.name)
              ) {
                openAuth();
                return;
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.dispatch({
                  ...CommonActions.navigate(route.name, route.params),
                  target: state.key,
                });
              }
            };

            const onLongPress = () => {
              if (
                !isAuthenticated &&
                !PUBLIC_TAB_ROUTE_NAMES.includes(route.name)
              ) {
                openAuth();
                return;
              }

              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <NavigationProvider
                key={route.key}
                route={route}
                navigation={descriptor.navigation}>
                <TabItem
                  route={route}
                  descriptor={descriptor}
                  isFocused={isFocused}
                  href={buildHref(route.name, route.params)}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  activeColor={activeColor}
                  inactiveColor={inactiveColor}
                />
              </NavigationProvider>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    // Float over scenes like default tabBarStyle: { position: 'absolute' }.
    // Do NOT set zIndex here — high zIndex + BlurView fights react-native-screens
    // nested native-stack transitions (white/blank screens). Paint order from
    // BottomTabView (tab bar rendered after scenes) keeps the bar on top.
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    marginHorizontal: HORIZONTAL_MARGIN,
    height: TAB_BAR_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
      },
      // Avoid Android elevation with BlurView — it creates a separate layer that
      // breaks native-stack screen compositing during nested pushes.
      android: {
        elevation: 0,
      },
      default: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 8,
      },
    }),
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
  glassTint: {
    ...StyleSheet.absoluteFill,
  },
  glassRim: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: StyleSheet.hairlineWidth,
    borderRadius: 1,
    opacity: 0.85,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.semiBold,
    marginTop: 2,
  },
  indicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: -4,
    right: -4,
    borderRadius: 15,
  },
});
