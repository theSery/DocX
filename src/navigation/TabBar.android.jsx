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

import DocumentsSvg from '../components/icons/DocumentsSvg';
import FilesSvg from '../components/icons/FilesSvg';
import HomeSvg from '../components/icons/HomeSvg';
import UserSvg from '../components/icons/UserSvg';
import { Typography } from '../components/typography';
import { useAuthSession, useTheme } from '../hooks';
import { FONT_FAMILY, palette } from '../theme';
import { PUBLIC_TAB_ROUTE_NAMES } from './tabConstants';

const TAB_BAR_CONTENT_HEIGHT = 64;
const PILL_WIDTH = 64;
const PILL_HEIGHT = 32;
const ICON_SIZE = 22;

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
  mass: 0.55,
};

/** Colors sampled from `example/bottom-nav.png`. */
const TAB_UI = {
  light: {
    bar: palette.mainWhite,
    pill: '#566FA2',
    content: '#21356B',
    iconActive: palette.mainWhite,
  },
  dark: {
    bar: palette.darkLight,
    pill: '#566FA2',
    content: palette.white,
    iconActive: palette.mainWhite,
  },
};

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
  href,
  onPress,
  onLongPress,
  contentColor,
  iconActiveColor,
}) {
  const Icon = ROUTE_ICONS[route.name];
  const { options } = descriptor;
  const label =
    typeof options.tabBarLabel === 'string'
      ? options.tabBarLabel
      : options.title ?? route.name;

  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused, progress]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.06 }],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + progress.value * 0.28,
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
      <View style={styles.iconSlot}>
        <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
          {Icon ? (
            <Icon
              width={ICON_SIZE}
              height={ICON_SIZE}
              fill={isFocused ? iconActiveColor : contentColor}
            />
          ) : null}
        </Animated.View>
      </View>
      <Animated.View style={labelAnimatedStyle}>
        <Typography
          variant="h6"
          numberOfLines={1}
          style={[styles.label, { color: contentColor }]}>
          {label}
        </Typography>
      </Animated.View>
    </PlatformPressable>
  );
}

/**
 * Material-style bottom tab bar matching `example/bottom-nav.png`:
 * white docked bar, rounded top corners, sliding pill behind the active icon.
 */
export function TabBar({ state, descriptors, navigation, insets }) {
  const { colors, isDarkMode } = useTheme();
  const { buildHref } = useLinkBuilder();
  const { isAuthenticated, openAuth } = useAuthSession();

  const ui = isDarkMode ? TAB_UI.dark : TAB_UI.light;
  const tabCount = state.routes.length;
  const [trackWidth, setTrackWidth] = useState(0);
  const itemWidth = tabCount > 0 ? trackWidth / tabCount : 0;

  const pillX = useSharedValue(0);
  const bottomInset = insets?.bottom ?? 0;

  useEffect(() => {
    if (itemWidth <= 0) {
      return;
    }

    const target = itemWidth * state.index + (itemWidth - PILL_WIDTH) / 2;
    pillX.value = withSpring(target, SPRING_CONFIG);
  }, [itemWidth, pillX, state.index]);

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const handleTrackLayout = useCallback(e => {
    const { width } = e.nativeEvent.layout;
    setTrackWidth(current => (width !== current ? width : current));
  }, []);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: ui.bar,
        paddingBottom: bottomInset,
        shadowColor: colors.shadow,
      },
    ],
    [bottomInset, colors.shadow, ui.bar],
  );

  return (
    <View pointerEvents="box-none" collapsable={false} style={styles.host}>
      <View collapsable={false} style={containerStyle}>
        <View
          onLayout={handleTrackLayout}
          collapsable={false}
          style={styles.track}
          accessibilityRole="tablist">
          {itemWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pill,
                pillAnimatedStyle,
                { backgroundColor: ui.pill },
              ]}
            />
          ) : null}
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            const isFocused = state.index === index;

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
                  contentColor={ui.content}
                  iconActiveColor={ui.iconActive}
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      default: {
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
    }),
  },
  track: {
    height: TAB_BAR_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  pill: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconSlot: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
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
    marginTop: 4,
    textAlign: 'center',
  },
});
