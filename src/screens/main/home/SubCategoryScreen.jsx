import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { SPACING } from './components/CategoriesList';
import { Accordion } from '../../../components/accordion';
import { CachedImage } from '../../../components/image';
import {
  HOME_STACK_HEADER_COLLAPSED_HEIGHT,
  HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT,
} from '../../../components/headers/stackHeaderConstants';
import { TAB_BAR_HEIGHT, TOP_HEADER_HEIGHT, WIDTH } from '../../../utils/dimensions';
import { palette } from '../../../theme';
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

  const onChooseTemplate = (template, category) => {
    const categoryIconUrl = category.iconUrl || iconUrl;
    showGlobalSheet({
      content: resolveImageSource(categoryIconUrl) ?? { uri: categoryIconUrl },
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
  });
