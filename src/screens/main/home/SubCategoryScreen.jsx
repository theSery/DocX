import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, useAnimatedRef } from 'react-native-reanimated';

import { SPACING } from './components/CategoriesList';
import { Accordion } from '../../../components/accordion';
import { HEIGHT, WIDTH } from '../../../utils/dimensions';
import { FONT_FAMILY, palette } from '../../../theme';
import { Typography } from '../../../components/typography/Typography';
import AuthButton from '../../../components/buttons/AuthButton';
import { useHomeStackHeaderScrollHandler, useThemedStyles, useAuthSession } from '../../../hooks';
import { useHomeStackHeaderScroll } from '../../../context/HomeStackHeaderScrollContext';
import { useEffect } from 'react';
import { showGlobalSheet } from '../../../components/GlobalSheet';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import { selectPersonalData } from '../../../store/slices/personalDataSlice';
import { useAppSelector } from '../../../store';
import { isPersonalDataCompleteForTemplate, isPassportDataCompleteForTemplate } from '../../../utils/personalDataValidation';
import { runAfterSheetDismiss } from '../../../utils/runAfterSheetDismiss';

const TOP_HEADER_HEIGHT = HEIGHT * 0.3;
const LIST_PANEL_TOP = TOP_HEADER_HEIGHT * 0.1018;



export function SubCategoryScreen({ route, navigation }) {
  const { item, title, subtitle, iconUrl, initialOpenKey } = route.params;
  const styles = useThemedStyles(createStyles);
  const personalData = useAppSelector(selectPersonalData);
  useEffect(() => {
    navigation.setOptions({ title, subtitle });
  }, [title, subtitle, navigation]);
  const { onScroll, onScrollViewLayout, onContentSizeChange } =
    useHomeStackHeaderScrollHandler();

  const { scrollY } = useHomeStackHeaderScroll();
  const scrollRef = useAnimatedRef();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = insets.bottom + 24;
  const { isAuthenticated, openAuth } = useAuthSession();
  const navigateToFillInDetails = (template) => {

    navigation.navigate('FillInDetails', {
      templateId: template.id,
    });
  }
  const navigateToProfileInfo = () => {
    runAfterSheetDismiss(() => {
      navigation.navigate('Account', {
        screen: 'ProfileInfo',
        params: { fromSubCategory: true },
      });
    });
  };

  const navigateToPassportInfo = () => {
    runAfterSheetDismiss(() => {
      navigation.navigate('Account', {
        screen: 'PassportInfo',
        params: { fromSubCategory: true },
      });
    });
  };

  const onChooseTemplate = (template) => {
    if (!isAuthenticated) {
      openAuth();
      return;
    }

    // if (!isPersonalDataCompleteForTemplate(personalData)) {
    //   showGlobalSheet({
    //     message: 'Հարգելի օգտատեր',
    //     description:
    //       'Ձեր անձնական տվյալները լրացված չեն։ Շարունակելուց առաջ խնդրում ենք ճիշտ լրացնել ձեր տվյալները։',
    //     actions: [
    //       { label: 'Այո', onPress: navigateToProfileInfo },
    //       { label: 'Փակել', destructive: true },
    //     ],
    //   });
    //   return;
    // }

    // if (!isPassportDataCompleteForTemplate(personalData)) {
    //   showGlobalSheet({
    //     message: 'Հարգելի օգտատեր',
    //     description:
    //       'Ձեր անձնագրային տվյալները լրացված չեն։ Շարունակելուց առաջ խնդրում ենք ճիշտ լրացնել ձեր տվյալները։',
    //     actions: [
    //       { label: 'Այո', onPress: navigateToPassportInfo },
    //       { label: 'Փակել', destructive: true },
    //     ],
    //   });
    //   return;
    // }

    showGlobalSheet({
      content: { uri: iconUrl },
      message: title,
      description: template.name,
      actions: [
        { label: template.relatedAction, onPress: () => navigateToFillInDetails(template) },
        { label: 'Փակել', destructive: true },
      ],
    });
  };
  return (
    <View style={styles.screen}>
      <Animated.Image
        source={{ uri: item.iconUrl }}
        entering={FadeIn.duration(400)}
        style={styles.categoryItemImageIcon}
      />
      <Animated.Text
        entering={FadeIn.duration(400)}
        style={styles.categoryItemText}
      >
        {item.name}
      </Animated.Text>
      <View style={styles.bg}>
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
          onScroll={onScroll}
          onLayout={onScrollViewLayout}
          onContentSizeChange={onContentSizeChange}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Accordion
            key={initialOpenKey ?? 'default'}
            items={item}
            initialOpenKey={initialOpenKey ?? null}
            scrollRef={scrollRef}
            scrollOffset={scrollY}
            staggeredEnter
            renderHeader={category => (
              <>
                <View style={styles.subCategoryIconWrap}>
                  <Image
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
                    titleStyle={{ width: '90%', lineHeight: 0 }}
                    endIcon={
                      <ArrowSvg width={14} height={14} fill={palette.white} />
                    }
                    title={template.name}
                    onPress={() => onChooseTemplate(template)}
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
      // height: 25,
      justifyContent: 'center',
      alignItems: 'center',
      // marginRight: 20,
      marginTop: 20,
      top: -120,
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
      top: -105,
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
      backgroundColor: colors.skyBlue,
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