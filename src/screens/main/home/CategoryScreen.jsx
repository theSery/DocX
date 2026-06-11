import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SPACING } from './components/CategoriesList';
import { AnimatedView } from '../../../components/animation/AnimatedView';
import {
  HEIGHT,
  WIDTH,
  customTransition,
  customTransitionLinear,
} from '../../../utils/dimensions';
import { FONT_FAMILY } from '../../../theme';
import { Typography } from '../../../components/typography/Typography';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import { useHomeStackHeaderScrollHandler, useThemedStyles, useTheme } from '../../../hooks';
import { useIsFocused } from '@react-navigation/native';

const TOP_HEADER_HEIGHT = HEIGHT * 0.3;
const TAB_BAR_HEIGHT = 60;
const LIST_PANEL_TOP = TOP_HEADER_HEIGHT * 0.1018;



export function CategoryScreen({ navigation, route }) {
  const { item } = route.params;
  const isFocused = useIsFocused();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { onScroll, onScrollViewLayout, onContentSizeChange } =
    useHomeStackHeaderScrollHandler();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = insets.bottom + TAB_BAR_HEIGHT + 24;

  return (
    <View style={styles.screen}>
      <Animated.Image
        source={{ uri: item.iconUrl }}
        sharedTransitionStyle={customTransitionLinear}
        style={styles.categoryItemImageIcon}
        sharedTransitionTag={`category-image-${item.id}-${isFocused}`}
      />
      <Animated.Text
        sharedTransitionTag={`category-text-${item.id}-${isFocused}`}
        sharedTransitionStyle={customTransitionLinear}
        style={styles.categoryItemText}
      >
        {item.name}
      </Animated.Text>

      <Animated.View
        style={styles.bg}
        sharedTransitionTag={`general-bg-${isFocused}`}
        sharedTransitionStyle={customTransition}
      >
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
          onScroll={onScroll}
          onLayout={onScrollViewLayout}
          onContentSizeChange={onContentSizeChange}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {item.subCategories?.map((category, index) => (
            <AnimatedView
              animation="fadeIn"
              animationConfig={{
                duration: 500,
                delay: (index + 1) * 150,
              }}
              key={category.id}
              style={styles.categoryItem}
            >

                <TouchableOpacity
            style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}
            onPress={() => navigation.navigate('SubCategoryScreen', { item: category.legalIssues, title: item.name, subtitle: category.name, iconUrl: item.iconUrl })}
          >
 
              <View style={styles.subCategoryIconWrap}>
                <Image
                  source={{ uri: category.iconUrl }}
                  style={styles.subCategoryIcon}
                />
              </View>
              <View style={styles.subCategoryTextWrap}>
                <Typography variant="h5" style={styles.subCategoryName}>
                  {category.name}
                </Typography>
              </View>
              <View style={styles.subCategoryArrowWrap}>
                <ArrowSvg width={20} height={20} fill={colors.iconAccent} />
              </View>
              </TouchableOpacity>
            </AnimatedView>
          ))}
        </Animated.ScrollView>
      </Animated.View>
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
    categoryItem: {
      // height: 65,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 24,
      backgroundColor: colors.pureWhite,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
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
      width: '20%',
    },
    subCategoryTextWrap: {
      width: '50%',
    },
    subCategoryArrowWrap: {
      width: '30%',
      alignItems: 'flex-end',
    },
  });