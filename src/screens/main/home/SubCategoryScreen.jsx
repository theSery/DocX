import { useCallback, useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { SPACING } from './components/CategoriesList';
import { Accordion } from '../../../components/accordion';
import { CachedImage } from '../../../components/image';
import {
  getHomeStackHeaderCollapsibleHeight,
  HOME_STACK_HEADER_COLLAPSED_HEIGHT,
} from '../../../components/headers/stackHeaderConstants';
import { TAB_BAR_HEIGHT, TOP_HEADER_HEIGHT, WIDTH } from '../../../utils/dimensions';
import { palette } from '../../../theme';
import { Typography } from '../../../components/typography/Typography';
import AuthButton from '../../../components/buttons/AuthButton';
import {
  useHomeStackHeaderScrollHandler,
  useIsCompactScreen,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import { useHomeStackHeaderScroll } from '../../../context/HomeStackHeaderScrollContext';
import { showGlobalSheet } from '../../../components/GlobalSheet';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectCategories } from '../../../store/slices/categoriesSlice';
import {
  addFavoriteTemplate,
  removeFavoriteTemplate,
} from '../../../store/slices/favoriteTemplatesSlice';
import { findLegalIssuesBySubCategory } from '../../../store/utils/applyFavoriteFlags';

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
    categoryId,
    subCategoryId,
  } = route.params;
  const styles = useThemedStyles(createStyles);
  const isCompactScreen = useIsCompactScreen();
  const headerCollapsibleHeight = getHomeStackHeaderCollapsibleHeight(isCompactScreen);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const categories = useAppSelector(selectCategories);
  const legalIssues = useMemo(
    () =>
      findLegalIssuesBySubCategory(categories, categoryId, subCategoryId) ??
      item ??
      [],
    [categories, categoryId, item, subCategoryId],
  );
  const canCollapse =
    (Array.isArray(legalIssues) ? legalIssues.length : 0) >
    COLLAPSE_ITEM_THRESHOLD;

  useEffect(() => {
    navigation.setOptions({ title, subtitle });
  }, [title, subtitle, navigation]);
  const { onScroll, onScrollViewLayout, onContentSizeChange } =
    useHomeStackHeaderScrollHandler(canCollapse);

  const { scrollY } = useHomeStackHeaderScroll();
  const scrollRef = useAnimatedRef();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = insets.bottom + TAB_BAR_HEIGHT + 24;

  const navigateToFillInDetails = (template, category) => {
    navigation.navigate('FillInDetails', {
      templateId: template.id,
      templateForm: template.form,
      templateSolution: template.solution,
      templateFactGroups: template.factGroups,
      templateName: template.name,
      categoryName: category?.name,
    });
  };

  const addFavorites = useCallback(
    async templates => {
      const templateIds = templates
        .filter(template => template?.id != null && !template.favorite)
        .map(template => template.id);

      if (templateIds.length === 0) {
        return;
      }

      try {
        for (const templateId of templateIds) {
          await dispatch(addFavoriteTemplate({ templateId })).unwrap();
        }
        showToast({
          title: 'Հաջողություն',
          body: 'Ձևանմուշը ավելացվել է ընտրյալներին։',
          type: 'success',
        });
      } catch (error) {
        showToast({
          title: 'Սխալ',
          body:
            error?.message ?? 'Չհաջողվեց ավելացնել ձևանմուշը ընտրյալներին։',
          type: 'error',
        });
      }
    },
    [dispatch, showToast],
  );

  const removeFavorites = useCallback(
    async templates => {
      const templateIds = templates
        .filter(template => template?.id != null && template.favorite)
        .map(template => template.id);

      if (templateIds.length === 0) {
        return;
      }

      try {
        for (const templateId of templateIds) {
          await dispatch(removeFavoriteTemplate({ templateId })).unwrap();
        }
        showToast({
          title: 'Հաջողություն',
          body: 'Ձևանմուշը հեռացվել է ընտրյալներից։',
          type: 'success',
        });
      } catch (error) {
        showToast({
          title: 'Սխալ',
          body:
            error?.message ?? 'Չհաջողվեց հեռացնել ձևանմուշը ընտրյալներից։',
          type: 'error',
        });
      }
    },
    [dispatch, showToast],
  );

  const onFavoritePress = useCallback(
    legalIssue => {
      const templates = legalIssue?.templates ?? [];
      if (templates.length === 0) {
        return;
      }

      if (legalIssue.favorite) {
        removeFavorites(templates);
        return;
      }

      addFavorites(templates);
    },
    [addFavorites, removeFavorites],
  );

  const onChooseTemplate = (template, category) => {
    const categoryIconUrl = category.iconUrl || iconUrl;
    showGlobalSheet({
      content: { uri: categoryIconUrl },
      message: category.name,
      description: template.name,
      contentImageStyle: { width: 56, height: 56 },
      messageStyle: { fontSize: 14, lineHeight: 20 },
      actions: [
        { label: 'Փակել', destructive: true },
        {
          label: template.relatedAction,
          onPress: () => navigateToFillInDetails(template, category),
        },
      ],
    });
  };
  return (
    <View style={styles.screen}>
      <View style={styles.bg}>
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={{
            paddingTop: headerCollapsibleHeight,
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
            items={legalIssues}
            initialOpenKey={initialOpenKey ?? null}
            openRequestId={openRequestId ?? null}
            scrollRef={scrollRef}
            scrollOffset={scrollY}
            scrollIntoViewOffset={headerCollapsibleHeight}
            staggeredEnter
            showFavorite
            onFavoritePress={onFavoritePress}
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
    bg: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: Platform.OS === 'ios' ? LIST_PANEL_TOP - 20 : LIST_PANEL_TOP,
      bottom: 0,
      width: WIDTH,
      paddingHorizontal: SPACING,
      overflow: 'hidden',
    },
    subCategoryIcon: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
    },
    subCategoryName: {
      letterSpacing: 0.4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    subCategoryIconWrap: {
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.skyBlue,
      borderRadius: 12,
      marginRight: 10,
    },
    subCategoryTextWrap: {
      flex: 1,
    },
  });
