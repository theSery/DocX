import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { favoriteTemplatesApi } from '../../../api';
import { Accordion } from '../../../components/accordion';
import AuthButton from '../../../components/buttons/AuthButton';
import { showGlobalSheet } from '../../../components/GlobalSheet';
import { CachedImage } from '../../../components/image';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import TrashSvg from '../../../components/icons/TrashSvg';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { Typography } from '../../../components/typography/Typography';
import {
  useHomeStackHeaderScrollHandler,
  useTheme,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import { useAppSelector } from '../../../store';
import { palette } from '../../../theme';
import { TAB_BAR_HEIGHT, TOP_HEADER_HEIGHT, WIDTH } from '../../../utils/dimensions';
import { resolveImageSource } from '../../../utils/imageCache';
import { SPACING } from './components/CategoriesList';

const LIST_PANEL_TOP = TOP_HEADER_HEIGHT * 0.1018;

function parseFavoriteTemplateIds(payload) {
  const raw = payload?.data ?? payload;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map(value => (typeof value === 'object' ? value?.id ?? value?.templateId : value))
    .filter(id => id != null)
    .map(Number);
}

function collectFavoriteLegalIssues(categories, favoriteIds) {
  if (!favoriteIds?.length) {
    return [];
  }

  const idSet = new Set(favoriteIds.map(Number));
  const result = [];

  for (const category of categories ?? []) {
    for (const subCategory of category.subCategories ?? []) {
      for (const legalIssue of subCategory.legalIssues ?? []) {
        const templates = (legalIssue.templates ?? []).filter(template =>
          idSet.has(Number(template.id)),
        );

        if (templates.length === 0) {
          continue;
        }

        result.push({
          ...legalIssue,
          iconUrl:
            legalIssue.iconUrl || subCategory.iconUrl || category.iconUrl,
          templates,
        });
      }
    }
  }

  return result;
}

export function FavoritesScreen({ navigation }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { items } = useAppSelector(state => state.categories);
  const [favoriteIds, setFavoriteIds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { onScroll, onScrollViewLayout, onContentSizeChange } =
    useHomeStackHeaderScrollHandler(false);
  const scrollRef = useAnimatedRef();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = insets.bottom + TAB_BAR_HEIGHT + 24;

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setIsLoading(true);
        const response = await favoriteTemplatesApi.getFavoriteTemplateIds({
          signal: controller.signal,
        });
        const payload = response?.data ?? response;
        console.log('favorite-templates/ids', payload);
        setFavoriteIds(parseFavoriteTemplateIds(payload));
      } catch (error) {
        if (error?.type === 'cancel') {
          return;
        }
        console.log('favorite-templates/ids error', error);
        setFavoriteIds([]);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const favoriteItems = useMemo(
    () => collectFavoriteLegalIssues(items, favoriteIds ?? []),
    [favoriteIds, items],
  );

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

  const onChooseTemplate = (template, category) => {
    const categoryIconUrl = category.iconUrl;
    showGlobalSheet({
      content: resolveImageSource(categoryIconUrl) ?? { uri: categoryIconUrl },
      message: category.name,
      description: template.name,
      contentImageStyle: { width: 56, height: 56 },
      messageStyle: { fontSize: 14, lineHeight: 20 },
      actions: [
        {
          label: template.relatedAction,
          onPress: () => navigateToFillInDetails(template, category),
        },
        { label: 'Փակել', destructive: true },
      ],
    });
  };

  const removeFavorite = useCallback(
    async templateId => {
      try {
        await favoriteTemplatesApi.removeFavoriteTemplate({ templateId });
        setFavoriteIds(current =>
          (current ?? []).filter(id => Number(id) !== Number(templateId)),
        );
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
    [showToast],
  );

  const onRemoveFavoritePress = useCallback(
    template => {
      showGlobalSheet({
        message: 'Համոզվա՞ծ եք, որ ցանկանում եք հեռացնել ընտրյալներից',
        description: template.name,
        actions: [
          {
            label: 'Այո',
            destructive: true,
            onPress: () => removeFavorite(template.id),
          },
          { label: 'Ոչ' },
        ],
      });
    },
    [removeFavorite],
  );

  const renderBody = () => {
    if (isLoading || favoriteIds == null) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (favoriteItems.length === 0) {
      return (
        <View style={styles.centeredState}>
          <Typography variant="h5" tone="secondary" style={styles.emptyText}>
            Նախընտրածներ չկան
          </Typography>
        </View>
      );
    }

    return (
      <Accordion
        key="favorites"
        items={favoriteItems}
        scrollRef={scrollRef}
        staggeredEnter
        renderHeader={category => (
          <>
            <View style={styles.subCategoryIconWrap}>
              <CachedImage
                source={{ uri: category.iconUrl }}
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
              <View key={template.id} style={styles.templateRow}>
                <AuthButton
                  titleStyle={styles.templateTitle}
                  style={styles.templateButton}
                  endIcon={
                    <ArrowSvg width={14} height={14} fill={palette.white} />
                  }
                  title={template.name}
                  onPress={() => onChooseTemplate(template, category)}
                />
                <AuthButton
                  style={styles.deleteButton}
                  startIcon={
                    <TrashSvg width={16} height={16} fill={palette.white} />
                  }
                  title=""
                  onPress={() => onRemoveFavoritePress(template)}
                />
              </View>
            ))
          ) : (
            <Typography variant="h5" tone="secondary">
              {'Մանրամասները շուտով հասանելի կլինեն'}
            </Typography>
          )
        }
      />
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.bg}>
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[
            { paddingBottom: scrollBottomPadding },
            (isLoading || favoriteItems.length === 0) && styles.scrollContentEmpty,
          ]}
          onScroll={onScroll}
          onLayout={onScrollViewLayout}
          onContentSizeChange={onContentSizeChange}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
          <ContentTiltes
            title="Նախընտրածներ"
            subtitle={`Դուք ունեք ${favoriteIds?.length ?? 0} նախընտրած`}
          />
          </View>
     
          {renderBody()}
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    screen: {
      flex: 1,
 
      paddingHorizontal: 16,
    },
    scrollView: {
      flex: 1,
  
      paddingHorizontal: 16,
    },
    contentContainer: {
      marginTop: -20,
    },
    scrollContentEmpty: {
      flexGrow: 1,
      justifyContent: 'flex-start',
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
    centeredState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 48,
    },
    emptyText: {
      textAlign: 'center',
    },
    subCategoryIcon: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
      backgroundColor: palette.skyBlue,
      padding: 10,
      borderRadius: 16,
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
    templateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    templateButton: {
      width: '88%',
    },
    templateTitle: {
      width: '95%',
      fontSize: 13,
      lineHeight: 16,
    },
    deleteButton: {
      width: '12%',
      minWidth: 36,
    },
  });
