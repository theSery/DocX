import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { SPACING } from './components/CategoriesList';
import { Accordion } from '../../../components/accordion';
import { CachedImage, useCachedImageSource } from '../../../components/image';
import {
  getHomeStackHeaderCollapseProgress,
  getHomeStackHeaderHeight,
} from '../../../components/headers/homeStackHeaderAnimation';
import {
  HOME_STACK_HEADER_COLLAPSED_HEIGHT,
  HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT,
  HOME_STACK_HEADER_EXPANDED_HEIGHT,
} from '../../../components/headers/stackHeaderConstants';
import { TAB_BAR_HEIGHT, TOP_HEADER_HEIGHT, WIDTH } from '../../../utils/dimensions';
import { FONT_FAMILY, palette } from '../../../theme';
import { Typography } from '../../../components/typography/Typography';
import AuthButton from '../../../components/buttons/AuthButton';
import { useHomeStackHeaderScrollHandler, useThemedStyles } from '../../../hooks';
import { useHomeStackHeaderScroll } from '../../../context/HomeStackHeaderScrollContext';
import { useEffect } from 'react';
import { showGlobalSheet } from '../../../components/GlobalSheet';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import { resolveImageSource } from '../../../utils/imageCache';

const LIST_PANEL_GAP = TOP_HEADER_HEIGHT * 0.1018;
// List sits under the collapsed header; expanded space is scroll padding so
// content rises into view as the header height shrinks (no opaque gap).
const LIST_PANEL_TOP = HOME_STACK_HEADER_COLLAPSED_HEIGHT + LIST_PANEL_GAP;
const COLLAPSE_ITEM_THRESHOLD = 8;



export function SubCategoryScreen({ route, navigation }) {
  const {
    item,
    title,
    subtitle,
    iconUrl,
    initialOpenKey,
    openRequestId,
    subCategoryId,
  } = route.params;
  const styles = useThemedStyles(createStyles);
  const canCollapse =
    (Array.isArray(item) ? item.length : 0) > COLLAPSE_ITEM_THRESHOLD;

  useEffect(() => {
    navigation.setOptions({ title, subtitle });
  }, [title, subtitle, navigation]);
  const { onScroll, onScrollViewLayout, onContentSizeChange } =
    useHomeStackHeaderScrollHandler(canCollapse);

  const { scrollY, collapseScrollEnd, collapseEnabled } =
    useHomeStackHeaderScroll();
  const scrollRef = useAnimatedRef();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = insets.bottom + TAB_BAR_HEIGHT + 24;
  const headerIconSource = useCachedImageSource(iconUrl);

  const categoryIconStyle = useAnimatedStyle(() => {
    const progress = getHomeStackHeaderCollapseProgress(
      scrollY.value,
      collapseScrollEnd.value,
      collapseEnabled.value,
    );
    const headerHeight = getHomeStackHeaderHeight(progress, true);
    return {
      // Transform tracks scroll on the UI thread without layout jumps from `top`.
      transform: [
        { translateY: headerHeight - HOME_STACK_HEADER_EXPANDED_HEIGHT },
      ],
      opacity: interpolate(
        progress,
        [0, 0.4, 0.8, 1],
        [1, 0.7, 0.2, 0],
        Extrapolation.CLAMP,
      ),
    };
  });

  const categoryTextStyle = useAnimatedStyle(() => {
    const progress = getHomeStackHeaderCollapseProgress(
      scrollY.value,
      collapseScrollEnd.value,
      collapseEnabled.value,
    );
    const headerHeight = getHomeStackHeaderHeight(progress, true);
    return {
      transform: [
        { translateY: headerHeight - HOME_STACK_HEADER_EXPANDED_HEIGHT },
      ],
      opacity: interpolate(
        progress,
        [0, 0.4, 0.8, 1],
        [1, 0.7, 0.2, 0],
        Extrapolation.CLAMP,
      ),
    };
  });

  const navigateToFillInDetails = (template) => {

    navigation.navigate('FillInDetails', {
      templateId: template.id,
      templateForm: template.form,
      templateSolution: template.solution,
    });
  };

  const onChooseTemplate = (template, category) => {
    const categoryIconUrl = category.iconUrl || iconUrl;
    showGlobalSheet({
      content: resolveImageSource(categoryIconUrl) ?? { uri: categoryIconUrl },
      message: category.name,
      description: template.name,
      contentImageStyle: { width: 56, height: 56 },
      messageStyle: { fontSize: 14, lineHeight: 20 },
      actions: [
        { label: template.relatedAction, onPress: () => navigateToFillInDetails(template) },
        { label: 'Փակել', destructive: true },
      ],
    });
  };
  return (
    <View style={styles.screen}>
      <Animated.View entering={FadeIn.duration(400)}>
        <Animated.Image
          source={headerIconSource}
          style={[styles.categoryItemImageIcon, categoryIconStyle]}
        />
      </Animated.View>
      <Animated.View entering={FadeIn.duration(400)}>
        <Animated.Text style={[styles.categoryItemText, categoryTextStyle]}>
          {item.name}
        </Animated.Text>
      </Animated.View>
      <View style={styles.bg}>
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={{
            paddingTop: HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT,
            paddingBottom: scrollBottomPadding,
          }}
          onScroll={onScroll}
          onLayout={onScrollViewLayout}
          onContentSizeChange={onContentSizeChange}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Accordion
            key={subCategoryId ?? 'subcategory'}
            items={item}
            initialOpenKey={initialOpenKey ?? null}
            openRequestId={openRequestId ?? null}
            scrollRef={scrollRef}
            scrollOffset={scrollY}
            scrollIntoViewOffset={HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT}
            staggeredEnter
            renderHeader={category => (
              <>
                <View style={styles.subCategoryIconWrap}>
                  <CachedImage
                    source={{ uri: category.iconUrl || iconUrl }}
                    style={styles.subCategoryIcon}
                  />
                </View>
                <View style={styles.subCategoryTextWrap}>
                  <Typography variant="h5" style={styles.subCategoryName}>
                    {category.name}
                  </Typography>
                </View>
              </>
            )}
            renderContent={category =>
              category.templates?.length > 0 ? (
                category.templates.map(template => (
                  <AuthButton
                    key={template.id}
                    // titleStyle={{ width: '90%', lineHeight: 0 }}
                    titleStyle={{ width: '90%'}}
                    endIcon={
                      <ArrowSvg width={14} height={14} fill={palette.white} />
                    }
                    title={template.name}
                    onPress={() => onChooseTemplate(template, category)}
                  />
                ))
              ) : (
                <Typography variant="h5" tone="secondary">
                  {'Մանրամասները շուտով հասանելի կլինեն'}
                </Typography>
              )
            }
          />
        </Animated.ScrollView>
      </View>
    </View>
  );
}


const createStyles = colors =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    categoryItemText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.medium,
      color: colors.text,
      width: '60%',
      left: 80,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      top: HOME_STACK_HEADER_EXPANDED_HEIGHT - 120,
      zIndex: 1000,
      position: 'absolute',
      right: 0,
    },
    categoryItemImageIcon: {
      width: 46,
      height: 46,
      borderRadius: 10,
      overflow: 'hidden',
      resizeMode: 'cover',
      position: 'absolute',
      left: 20,
      top: HOME_STACK_HEADER_EXPANDED_HEIGHT - 105,
      zIndex: 1000,
    },
    bg: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: LIST_PANEL_TOP,
      bottom: 0,
      width: WIDTH,
      paddingHorizontal: SPACING,
      overflow: 'hidden',
    },
    subCategoryIcon: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
      backgroundColor: colors.cardSelected,
      padding: 10,
      borderRadius: 16,
    },
    bgCategoryItem: {
      height: 40,
      resizeMode: 'contain',
      borderRadius: 10,
      backgroundColor: colors.background,
      position: 'absolute',
      width: '100%',
      top: -110,
      zIndex: 500,
    },
    headerBackground: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.background,
      height: TOP_HEADER_HEIGHT + 32,
    },
    subCategoryName: {
      letterSpacing: 0.4,
    },
    subCategoryIconWrap: {
      marginRight: 12,
    },
    subCategoryTextWrap: {
      flex: 1,
    },
  });
