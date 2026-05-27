import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import MainHeader from './MainHeader';
import { useThemedStyles } from '../../hooks';
import { SearchComponent } from '../titleComponents/SearchComponent';
import { Typography } from '../typography';
import { useHomeStackHeaderScroll } from '../../context/HomeStackHeaderScrollContext';
import {
  HOME_STACK_HEADER_COLLAPSE_ANIMATION,
  HOME_STACK_HEADER_COLLAPSE_DISTANCE,
  HOME_STACK_HEADER_COLLAPSED_HEIGHT,
  HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT,
  HOME_STACK_HEADER_EXPANDED_HEIGHT,
} from './homeStackHeaderConstants';

const collapseEasing = Easing.out(Easing.cubic);

export {
  HOME_STACK_HEADER_EXPANDED_HEIGHT as HOME_STACK_HEADER_HEIGHT,
  HOME_STACK_HEADER_COLLAPSED_HEIGHT,
  HOME_STACK_HEADER_COLLAPSE_DISTANCE,
} from './homeStackHeaderConstants';

const createStyles = colors =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      // overflow: 'hidden',
    },
    collapsible: {
      overflow: 'hidden',
    },
    headerRow: {
      paddingTop: 10,
    },
    titleContainer: {
      marginTop: 10,
    },
    loginTitle: {
      letterSpacing: 2,
    },
    subTitle: {
      color: colors.textSecondary,
      letterSpacing: 0.4,
    },
    searchWrap: {
      paddingTop: 8,
      paddingBottom: 8,
    },
  });

const StaticHomeStackHeader = ({
  styles,
  onPress,
  title,
  subtitle,
  showSearch,
}) => (
  <View
    style={[
      styles.container,
      {
        height: showSearch
          ? HOME_STACK_HEADER_EXPANDED_HEIGHT
          : HOME_STACK_HEADER_EXPANDED_HEIGHT -
            HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT,
      },
    ]}
  >
    <View style={styles.collapsible}>
      <View style={styles.headerRow}>
        <MainHeader onPress={onPress} />
      </View>
      {(title || subtitle) && (
        <View style={styles.titleContainer}>
          {title ? (
            <Typography variant="h2" style={styles.loginTitle}>
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography variant="h6" style={styles.subTitle}>
              {subtitle}
            </Typography>
          ) : null}
        </View>
      )}
    </View>
    {showSearch ? (
      <View style={styles.searchWrap}>
        <SearchComponent />
      </View>
    ) : null}
  </View>
);

const CollapsibleHomeStackHeader = ({
  styles,
  onPress,
  title,
  subtitle,
  showSearch,
}) => {
  const { scrollY } = useHomeStackHeaderScroll();

  const smoothScrollY = useDerivedValue(() =>
    withTiming(scrollY.value, {
      ...HOME_STACK_HEADER_COLLAPSE_ANIMATION,
      easing: collapseEasing,
    }),
  );

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      smoothScrollY.value,
      [0, HOME_STACK_HEADER_COLLAPSE_DISTANCE],
      [
        showSearch
          ? HOME_STACK_HEADER_EXPANDED_HEIGHT
          : HOME_STACK_HEADER_EXPANDED_HEIGHT - HOME_STACK_HEADER_COLLAPSED_HEIGHT,
        showSearch ? HOME_STACK_HEADER_COLLAPSED_HEIGHT : 0,
      ],
      Extrapolation.CLAMP,
    ),
  }));

  const animatedCollapsibleStyle = useAnimatedStyle(() => ({
    height: interpolate(
      smoothScrollY.value,
      [0, HOME_STACK_HEADER_COLLAPSE_DISTANCE],
      [HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT, 0],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(
      smoothScrollY.value,
      [0, HOME_STACK_HEADER_COLLAPSE_DISTANCE * 0.65],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          smoothScrollY.value,
          [0, HOME_STACK_HEADER_COLLAPSE_DISTANCE],
          [0, -12],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Animated.View style={[styles.collapsible, animatedCollapsibleStyle]}>
        <View style={styles.headerRow}>
          <MainHeader onPress={onPress} />
        </View>
        {(title || subtitle) && (
          <View style={styles.titleContainer}>
            {title ? (
              <Typography variant="h2" style={styles.loginTitle}>
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography variant="h6" style={styles.subTitle}>
                {subtitle}
              </Typography>
            ) : null}
          </View>
        )}
      </Animated.View>
      {showSearch ? (
        <View style={styles.searchWrap}>
          <SearchComponent />
        </View>
      ) : null}
    </Animated.View>
  );
};

const HomeStackHeader = ({
  onPress,
  title,
  subtitle,
  showSearch = true,
  collapsible = true,
}) => {
  const styles = useThemedStyles(createStyles);

  if (!collapsible) {
    return (
      <StaticHomeStackHeader
        styles={styles}
        onPress={onPress}
        title={title}
        subtitle={subtitle}
        showSearch={showSearch}
      />
    );
  }

  return (
    <CollapsibleHomeStackHeader
      styles={styles}
      onPress={onPress}
      title={title}
      subtitle={subtitle}
      showSearch={showSearch}
    />
  );
};

export default HomeStackHeader;
