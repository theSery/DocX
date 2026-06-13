import { useContext, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '../hooks';
import { Typography } from '../components/typography';
import DocumentsSvg from '../components/icons/DocumentsSvg';
import UserSvg from '../components/icons/UserSvg';
import HomeSvg from '../components/icons/HomeSvg';
import FilesSvg from '../components/icons/FilesSvg';
import { FONT_FAMILY, palette } from '../theme';
import { useAuthSession } from '../hooks';
import { PUBLIC_TAB_ROUTE_NAMES } from './TabNavigator';

const TAB_BAR_HEIGHT = 60;
const HORIZONTAL_MARGIN = 16;

const GLASS = {
  light: {
    blurAmount: 32,
    tint: 'rgba(255, 255, 255, 1)',
    overlayColor: 'rgba(255, 255, 255, 1)',
    fallback: '#FFFFFF',
    border: 'rgba(255, 255, 255, 1)',
    borderWidth: 5,
    sheen: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.55 },
      { offset: '38%', color: '#FFFFFF', opacity: 0.14 },
      { offset: '100%', color: '#FFFFFF', opacity: 0 },
    ],
    rim: 'rgba(255, 255, 255, 1)',
  },
  dark: {
    blurAmount: 28,
    tint: 'rgba(22, 24, 40, 0.42)',
    overlayColor: 'rgba(17, 17, 29, 0.45)',
    fallback: '#11111D',
    border: 'rgba(255, 255, 255, 0.14)',
    sheen: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.2 },
      { offset: '45%', color: '#FFFFFF', opacity: 0.05 },
      { offset: '100%', color: '#FFFFFF', opacity: 0 },
    ],
    rim: 'rgba(255, 255, 255, 0.22)',
  },
};

function GlassSheen({ stops }) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="tabBarGlassSheen" x1="0" y1="0" x2="0" y2="1">
          {stops.map(stop => (
            <Stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#tabBarGlassSheen)" />
    </Svg>
  );
}

const ROUTE_ICONS = {
  Home: HomeSvg,
  Documents: DocumentsSvg,
  Files: FilesSvg,
  Account: UserSvg,
};

function TabItem({
  route,
  descriptor,
  isFocused,
  onPress,
  onLongPress,
  activeColor,
  inactiveColor,
}) {
  const Icon = ROUTE_ICONS[route.name];
  const { options } = descriptor;
  const label = options.tabBarLabel ?? options.title ?? route.name;

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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
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
    </Pressable>
  );
}

export function BlurTabBar({ state, descriptors, navigation }) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, openAuth } = useAuthSession();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);

  const activeRoute = state.routes[state.index];
  const activeOptions = descriptors[activeRoute.key]?.options;
  const isHidden = activeOptions?.tabBarStyle?.display === 'none';

  useEffect(() => {
    if (isHidden) {
      onHeightChange?.(0);
    }
  }, [isHidden, onHeightChange]);

  const activeColor =  colors.background;
  const inactiveColor =  colors.text;
  const tabCount = state.routes.length;

  const [trackWidth, setTrackWidth] = useState(0);
  const itemWidth = tabCount > 0 ? trackWidth / tabCount : 0;

  const indicatorX = useSharedValue(0);

  useEffect(() => {
    indicatorX.value = withSpring(itemWidth * state.index, {
      damping: 20,
      stiffness: 180,
      mass: 0.6,
    });
  }, [indicatorX, itemWidth, state.index]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    width: itemWidth,
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleHostLayout = e => {
    const { height } = e.nativeEvent.layout;
    onHeightChange?.(height + insets.bottom);
  };

  const handleTrackLayout = e => {
    const { width } = e.nativeEvent.layout;
    if (width !== trackWidth) {
      setTrackWidth(width);
    }
  };
  const glass = isDarkMode ? GLASS.dark : GLASS.light;
  const blurType = isDarkMode ? 'dark' : 'light';

  const containerStyle = {
    bottom: insets.bottom - 10,
    borderColor: glass.border,
  };

  if (isHidden) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={styles.host}
      onLayout={handleHostLayout}>
      <View
        onLayout={handleTrackLayout}
        style={[styles.container, containerStyle]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={blurType}
          blurAmount={glass.blurAmount}
          reducedTransparencyFallbackColor={glass.fallback}
          {...(Platform.OS === 'android' && {
            overlayColor: glass.overlayColor,
          })}
        />
        <View
          pointerEvents="none"
          style={[styles.glassTint, { backgroundColor: glass.tint }]}
        />
        <GlassSheen stops={glass.sheen} />
        <View
          pointerEvents="none"
          style={[styles.glassRim, { backgroundColor: glass.rim }]}
        />

          <Animated.Image source={require('../assets/images/barIndicator.webp')}   style={[
            styles.indicator,
            indicatorAnimatedStyle,
            {height: 55}
          ]}
          resizeMode="cover"
          />
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              if (!isAuthenticated && !PUBLIC_TAB_ROUTE_NAMES.includes(route.name)) {
                openAuth();
                return;
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              if (!isAuthenticated && !PUBLIC_TAB_ROUTE_NAMES.includes(route.name)) {
                openAuth();
                return;
              }

              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                route={route}
                descriptor={descriptor}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // zIndex: 500,
  },
  container: {
    marginHorizontal: HORIZONTAL_MARGIN,
    height: TAB_BAR_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 16,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
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
