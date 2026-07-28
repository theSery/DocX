import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import MainHeader from './MainHeader';
import { useThemedStyles } from '../../hooks';
import { SearchComponent } from '../titleComponents/SearchComponent';
import { Typography } from '../typography';
import { useHomeStackHeaderScroll } from '../../context/HomeStackHeaderScrollContext';
import {
  getHomeStackHeaderCollapseProgress,
  getHomeStackHeaderHeight,
} from './homeStackHeaderAnimation';
import {
  HOME_STACK_HEADER_COLLAPSE_DISTANCE,
  HOME_STACK_HEADER_COLLAPSED_HEIGHT,
  HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT,
  HOME_STACK_HEADER_EXPANDED_HEIGHT,
} from './stackHeaderConstants';

// Constrain search to the category/subcategory the user navigated into.
const resolveSearchScope = route => {
  if (route?.name === 'Category') {
    return { categoryId: route.params?.item?.id };
  }
  if (route?.name === 'SubCategoryScreen') {
    return {
      categoryId: route.params?.categoryId,
      subCategoryId: route.params?.subCategoryId,
    };
  }
  return {};
};

export {
  HOME_STACK_HEADER_EXPANDED_HEIGHT as HOME_STACK_HEADER_HEIGHT,
  HOME_STACK_HEADER_COLLAPSED_HEIGHT,
  HOME_STACK_HEADER_COLLAPSE_DISTANCE,
} from './stackHeaderConstants';


const StaticHomeStackHeader = ({
  styles,
  onPress,
  title,
  subtitle,
  showSearch,
  searchScope,
}) => (
  <View
    style={[
      styles.container,
      {
        height: showSearch
          ? HOME_STACK_HEADER_EXPANDED_HEIGHT
          : HOME_STACK_HEADER_EXPANDED_HEIGHT +
            HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT,
      },
    ]}
  >
    <View style={styles.collapsible}>
      <View style={styles.headerRow}>
        <MainHeader onPress={onPress} isHome={true}/>
      </View>
      {title || subtitle ? (
        <View style={styles.titleContainer}>
          {title ? (
            <Typography variant="h2" style={styles.loginTitle}>
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography variant="h6" tone="secondary" style={{ letterSpacing: 0.4 }}>
              {subtitle}
            </Typography>
          ) : null}
        </View>
      ): <View style={{ height: 60 }} />  }
    </View>
    {showSearch ? (
      <View style={styles.searchWrap}>
        <SearchComponent {...searchScope} />
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
  searchScope,
}) => {
  const { smoothScrollY, collapseScrollEnd, collapseEnabled } =
    useHomeStackHeaderScroll();

  const animatedContainerStyle = useAnimatedStyle(() => {
    const progress = getHomeStackHeaderCollapseProgress(
      smoothScrollY.value,
      collapseScrollEnd.value,
      collapseEnabled.value,
    );
    return {
      height: getHomeStackHeaderHeight(progress, showSearch),
    };
  });

  const animatedCollapsibleStyle = useAnimatedStyle(() => {
    const progress = getHomeStackHeaderCollapseProgress(
      smoothScrollY.value,
      collapseScrollEnd.value,
      collapseEnabled.value,
    );
    return {
      height: interpolate(
        progress,
        [0, 1],
        [HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT, 0],
        Extrapolation.CLAMP,
      ),
      opacity: interpolate(
        progress,
        [0, 0.35, 0.75, 1],
        [1, 0.85, 0.25, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            progress,
            [0, 1],
            [0, -10],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Animated.View style={[styles.collapsible, animatedCollapsibleStyle]}>
        <View style={styles.headerRow}>
          <MainHeader onPress={onPress} isHome={true}/>
        </View>
        {(title || subtitle) && (
          <View style={styles.titleContainer}>
            {title ? (
              <Typography variant="h2" style={[styles.loginTitle, {fontSize: 16, letterSpacing: 0, }]}>
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography variant="h6" tone="secondary" style={{ letterSpacing: 0.4 }} numberOfLines={1} ellipsizeMode="tail">
                {subtitle}
              </Typography>
            ) : null}
          </View>
        )}
      </Animated.View>
      {showSearch ? (
        <View style={[styles.searchWrap, styles.searchWrapCollapsed]}>
          <SearchComponent {...searchScope} />
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
  route,
}) => {
  const styles = useThemedStyles(createStyles);
  const searchScope = resolveSearchScope(route);

  if (!collapsible) {
    return (
      <StaticHomeStackHeader
        styles={styles}
        onPress={onPress}
        title={title}
        subtitle={subtitle}
        showSearch={showSearch}
        searchScope={searchScope}
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
      searchScope={searchScope}
    />
  );
};

export default HomeStackHeader;


const HEADER_Z_INDEX = 2000;

const createStyles = colors =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      zIndex: HEADER_Z_INDEX,
      elevation: HEADER_Z_INDEX,
      // Keep visible so SearchComponent dropdown is not clipped.
      overflow: 'visible',
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
    searchWrap: {
      paddingTop: 8,
      paddingBottom: 8,
      marginTop: 8,
      zIndex: HEADER_Z_INDEX + 1,
      elevation: HEADER_Z_INDEX + 1,
      overflow: 'visible',
    },
    searchWrapCollapsed: {
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: 0,
    },
  });
