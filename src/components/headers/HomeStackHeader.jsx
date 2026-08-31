import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import MainHeader from './MainHeader';
import FavoritesButton from '../buttons/FavoritesButton';
import { useAuthSession, useThemedStyles } from '../../hooks';
import { SearchComponent } from '../titleComponents/SearchComponent';
import { CachedImage } from '../image';
import { Typography } from '../typography';
import { FONT_FAMILY } from '../../theme';
import { useHomeStackHeaderScroll } from '../../context/HomeStackHeaderScrollContext';
import {
  getHomeStackHeaderCollapseProgress,
  getHomeStackHeaderHeight,
} from './homeStackHeaderAnimation';
import {
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


const HeaderTitleBlock = ({ styles, title, subtitle, iconUrl }) => {
  if (!title && !subtitle && !iconUrl) {
    return <View style={{ height: 60 }} />;
  }

  if (iconUrl) {
    return (
      <View style={styles.titleWithIconRow}>
        <CachedImage
          source={{ uri: iconUrl }}
          style={styles.categoryIcon}
        />
        {title ? (
          <Typography
            variant="h2"
            style={styles.titleWithIcon}
            numberOfLines={2}
          >
            {title}
          </Typography>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.titleContainer, {marginTop: 5}]}>
      {title ? (
        <Typography variant="h2" style={styles.loginTitle} numberOfLines={2}>
          {title}
        </Typography>
      ) : null}
      {subtitle ? (
        <Typography variant="h6" tone="secondary" numberOfLines={2}  style={{ letterSpacing: 0.4 }}>
          {subtitle}
        </Typography>
      ) : null}
    </View>
  );
};

const StaticHomeStackHeader = ({
  styles,
  onPress,
  onFavoritesPress,
  title,
  subtitle,
  showSearch,
  searchScope,
  iconUrl,
  extraHeight = 0,
}) => (
  <View
    style={[
      styles.container,
      {
        height:
          (showSearch
            ? HOME_STACK_HEADER_EXPANDED_HEIGHT
            : HOME_STACK_HEADER_EXPANDED_HEIGHT +
              HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT) + extraHeight,
      },
    ]}
  >
    <View style={styles.collapsible}>
      <View style={styles.headerRow}>
        <MainHeader
          onPress={onPress}
          isHome={true}
          rightAction={
            onFavoritesPress ? (
              <FavoritesButton onPress={onFavoritesPress} />
            ) : null
          }
        />
      </View>
      <HeaderTitleBlock
        styles={styles}
        title={title}
        subtitle={subtitle}
        iconUrl={iconUrl}
      />
    </View>
    {showSearch ? (
      <View collapsable={false} style={styles.searchWrap}>
        <SearchComponent {...searchScope} />
      </View>
    ) : null}
  </View>
);

const CollapsibleHomeStackHeader = ({
  styles,
  onPress,
  onFavoritesPress,
  title,
  subtitle,
  showSearch,
  searchScope,
  extraHeight = 0,
}) => {
  const { scrollY, collapseScrollEnd, collapseEnabled } =
    useHomeStackHeaderScroll();
  const extraHeightSv = useSharedValue(extraHeight);

  useEffect(() => {
    extraHeightSv.value = extraHeight;
  }, [extraHeight, extraHeightSv]);

  // Height tracks scroll 1:1. Title exits via opacity + translateY (compositor).
  // Search is bottom-anchored so it rides the height change without sibling
  // layout thrash — that was the source of stepped jumps on slow scrolls.
  const animatedContainerStyle = useAnimatedStyle(() => {
    const progress = getHomeStackHeaderCollapseProgress(
      scrollY.value,
      collapseScrollEnd.value,
      collapseEnabled.value,
    );
    return {
      height: getHomeStackHeaderHeight(progress, showSearch) + extraHeightSv.value,
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    const progress = getHomeStackHeaderCollapseProgress(
      scrollY.value,
      collapseScrollEnd.value,
      collapseEnabled.value,
    );
    return {
      opacity: interpolate(
        progress,
        [0, 0.35, 0.6],
        [1, 0.45, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            progress,
            [0, 1],
            [0, -HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT * 0.35],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.titleLayer, animatedTitleStyle, ]}
      >
        <View style={[styles.headerRow, { marginBottom: 5}]}>
          <MainHeader
            onPress={onPress}
            isHome={true}
            rightAction={
              onFavoritesPress ? (
                <FavoritesButton onPress={onFavoritesPress} />
              ) : null
            }
          />
        </View>
        {(title || subtitle) && (
          <View style={[styles.titleContainer, { marginTop: 5 }]}>
            {title ? (
              <Typography
                variant="h2"
                style={[styles.loginTitle, { fontSize: 14, letterSpacing: 0, lineHeight: 20, marginBottom: 3 }]}
                numberOfLines={2}
              >
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography variant="h6" tone="secondary" numberOfLines={2} ellipsizeMode="tail" style={{ letterSpacing: 0.4, fontSize: 12 }} >
                {subtitle}
              </Typography>
            ) : null}
          </View>
        )}
      </Animated.View>
      {showSearch ? (
        <View
          collapsable={false}
          style={[styles.searchWrap, styles.searchWrapCollapsed, styles.searchLayer]}
        >
          <SearchComponent {...searchScope} />
        </View>
      ) : null}
    </Animated.View>
  );
};

const HomeStackHeader = ({
  onPress,
  onFavoritesPress,
  title,
  subtitle,
  showSearch = true,
  collapsible = true,
  iconUrl,
  route,
}) => {
  const styles = useThemedStyles(createStyles);
  const { isAuthenticated } = useAuthSession();
  const searchScope = resolveSearchScope(route);
  const favoritesPress = isAuthenticated ? onFavoritesPress : undefined;
  const [androidDropdownHeight, setAndroidDropdownHeight] = useState(0);
  const extraHeight = Platform.OS === 'android' ? androidDropdownHeight : 0;
  const resolvedSearchScope =
    Platform.OS === 'android'
      ? { ...searchScope, onDropdownHeightChange: setAndroidDropdownHeight }
      : searchScope;

  if (!collapsible) {
    return (
      <StaticHomeStackHeader
        styles={styles}
        onPress={onPress}
        onFavoritesPress={favoritesPress}
        title={title}
        subtitle={subtitle}
        showSearch={showSearch}
        searchScope={resolvedSearchScope}
        iconUrl={iconUrl}
        extraHeight={extraHeight}
      />
    );
  }

  return (
    <CollapsibleHomeStackHeader
      styles={styles}
      onPress={onPress}
      onFavoritesPress={favoritesPress}
      title={title}
      subtitle={subtitle}
      showSearch={showSearch}
      searchScope={resolvedSearchScope}
      extraHeight={extraHeight}
    />
  );
};

export default HomeStackHeader;


const HEADER_Z_INDEX = 2000;

const createStyles = colors =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingHorizontal: 10,
      zIndex: HEADER_Z_INDEX,
      elevation: HEADER_Z_INDEX,
      // Keep visible so SearchComponent dropdown is not clipped.
      overflow: 'visible',
    },
    titleLayer: {
      position: 'absolute',
      top: 0,
      left: 16,
      right: 16,
    },
    searchLayer: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 0,
    },
    headerRow: {
      paddingTop: 10,
    },
    titleContainer: {
      // marginTop: 10,
    },
    titleWithIconRow: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    categoryIcon: {
      width: 46,
      height: 46,
      borderRadius: 10,
      overflow: 'hidden',
      resizeMode: 'contain',
    },
    titleWithIcon: {
      flex: 1,
      fontSize: 16,
      fontFamily: FONT_FAMILY.medium,
      letterSpacing: 0,
      lineHeight: 20,
    },
    loginTitle: {
      letterSpacing: 2,
      // fontSize: 14,
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
      paddingTop: 8,
      paddingBottom: 4,
      marginTop: 0,
    },
  });
