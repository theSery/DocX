import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View, Image } from 'react-native';
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
import { BlurView } from '@sbaiahmed1/react-native-blur';

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
/** Matches example pill: slight inset so long labels (e.g. Փաստաթղթեր) still fit */
const INDICATOR_INSET = 1;
const PILL_RADIUS = TAB_BAR_HEIGHT / 2;
const INDICATOR_RADIUS = (TAB_BAR_HEIGHT - INDICATOR_INSET * 2) / 2;

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
 * Glass tokens for the floating tab bar — tuned to example/ references.
 */
function getTabBarGlass(isDarkMode) {
  return isDarkMode ? GLASS.dark : GLASS.light;
}

/**
 * Frosted glass plate: native blur → milky tint → refraction sheen → rims.
 * Layer order matters — fill sits above blur so the backdrop stays visible.
 */
function TabBarBackground({ glass }) {
  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={StyleSheet.absoluteFill}>
      <BlurView
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        blurType={glass.blurType}
        blurAmount={glass.blurAmount}
        reducedTransparencyFallbackColor={glass.fallback}
      />
      {/* Milky translucent plate */}
      {/* <View
        style={[StyleSheet.absoluteFill, { backgroundColor: glass.fill }]}
      /> */}
      {/* Soft top wash */}
      {/* <View
        style={[styles.glassHighlight, { backgroundColor: glass.highlight }]}
      /> */}
      {/* Vertical refraction (bright rims + lower-middle caustic) */}
      {/* <GlassSheen
        stops={glass.sheen}
        gradientId="tabBarGlassSheen"
        direction="vertical"
      /> */}
      {/* Crisp glass edge highlights */}
      {/* <View style={[styles.glassRimTop, { backgroundColor: glass.rim }]} />
      <View
        style={[styles.glassRimBottom, { backgroundColor: glass.rimBottom }]}
      /> */}
    </View>
  );
}

/**
 * Active-tab pill: rounded wrapper clips on all corners, with nested blur +
 * tinted indicator image for a frosted blue glass look.
 */
function TabBarIndicator({ animatedStyle }) {
  return (
    <Animated.View
      pointerEvents="none"
      collapsable={false}
      style={[styles.indicator, animatedStyle]}>
      <BlurView
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        blurType="extraDark"
        blurAmount={18}
        reducedTransparencyFallbackColor={palette.mainBlue}
      />
      <Image
        source={require('../assets/images/barIndicator.webp')}
        style={styles.indicatorImage}
        resizeMode="cover"
      />
      {/* Soft blue glass tint so the asset reads translucent over the blur */}
      <View style={styles.indicatorTint} />
    </Animated.View>
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
    transform: [{ scale: 1 + progress.value * 0.06 }],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxHeight: 2 + progress.value * 14,
    marginTop: progress.value * 2,
    overflow: 'hidden',
  }));

  const accessibilityLabel =
    options.tabBarAccessibilityLabel !== undefined
      ? options.tabBarAccessibilityLabel
      : typeof label === 'string'
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
          style={[styles.label, { color: activeColor }]}>
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
export function TabBar({ state, descriptors, navigation, insets }) {
  const { colors, isDarkMode } = useTheme();
  const { buildHref } = useLinkBuilder();
  const { isAuthenticated, openAuth } = useAuthSession();

  const tabCount = state.routes.length;
  const [trackWidth, setTrackWidth] = useState(0);
  const itemWidth = tabCount > 0 ? trackWidth / tabCount : 0;

  const indicatorX = useSharedValue(0);

  const glass = useMemo(() => getTabBarGlass(isDarkMode), [isDarkMode]);
  const shadowWrapStyle = useMemo(
    () => [
      styles.shadowWrap,
      { shadowColor: isDarkMode ? '#000000' : colors.shadow },
    ],
    [colors.shadow, isDarkMode],
  );
  const activeColor = palette.mainWhite;
  const inactiveColor = colors.icons;
  const bottomInset = Math.max((insets?.bottom ?? 0) - BOTTOM_OFFSET, 0);

  useEffect(() => {
    if (itemWidth <= 0) {
      return;
    }

    indicatorX.value = withSpring(itemWidth * state.index, SPRING_CONFIG);
  }, [indicatorX, itemWidth, state.index]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    // Slightly wider than the tab slot so long titles like «Փաստաթղթեր» fit.
    const extraWidth = Math.min(itemWidth * 0.12, 10);
    const width = Math.max(itemWidth - INDICATOR_INSET * 2 + extraWidth, 0);
    return {
      width,
      transform: [
        {
          translateX:
            indicatorX.value + INDICATOR_INSET - extraWidth / 2,
        },
      ],
    };
  });

  const handleTrackLayout = useCallback(e => {
    const { width } = e.nativeEvent.layout;
    setTrackWidth(current => (width !== current ? width : current));
  }, []);

  return (
    <View
      pointerEvents="box-none"
      collapsable={false}
      style={[styles.host, { paddingBottom: bottomInset }]}>
      {/* Shadow lives on an outer wrapper so overflow:hidden doesn't clip it */}
      <View style={shadowWrapStyle}>
        <View
          onLayout={handleTrackLayout}
          collapsable={false}
          style={[styles.container, { borderColor: glass.border }]}>
          <TabBarBackground glass={glass} />
          <TabBarIndicator animatedStyle={indicatorAnimatedStyle} />
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
  shadowWrap: {
    marginHorizontal: HORIZONTAL_MARGIN,
    borderRadius: PILL_RADIUS,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 22,
      },
      android: {
        elevation: 12,
      },
      default: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 22,
      },
    }),
  },
  container: {
    height: TAB_BAR_HEIGHT,
    borderRadius: PILL_RADIUS,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    backgroundColor: 'transparent',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
  },
  glassRimTop: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: StyleSheet.hairlineWidth,
    borderRadius: 1,
  },
  glassRimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 18,
    right: 18,
    height: StyleSheet.hairlineWidth,
    borderRadius: 1,
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
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    top: INDICATOR_INSET,
    bottom: INDICATOR_INSET,
    left: 0,
    borderRadius: INDICATOR_RADIUS,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  indicatorImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    borderRadius: INDICATOR_RADIUS,
    opacity: 0.72,
  },
  indicatorTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(29, 61, 129, 0.35)',
    borderRadius: INDICATOR_RADIUS,
  },
});
