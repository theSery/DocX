import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SPACING } from './components/CategoriesList';
import { AnimatedView } from '../../../components/animation/AnimatedView';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  HEIGHT,
  WIDTH,
  customTransition,
  customTransition2,
  customTransitionLinear,
} from '../../../utils/dimensions';
import { colors, FONT_FAMILY } from '../../../theme';
import { palette } from '../../../theme';
import { Typography } from '../../../components/typography/Typography';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import { useHomeStackHeaderScrollHandler } from '../../../hooks';

const TOP_HEADER_HEIGHT = HEIGHT * 0.3;
const TAB_BAR_HEIGHT = 60;
const LIST_PANEL_TOP = TOP_HEADER_HEIGHT * 0.1018;

export function CategoryScreen({ route }) {
  const { item } = route.params;
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
        entering={FadeIn.duration(500)}
        sharedTransitionTag={`category-image-${item.id}`}
      />
      <Animated.Text
        sharedTransitionTag={`category-text-${item.id}`}
        sharedTransitionStyle={customTransitionLinear}
        entering={FadeIn.duration(500)}
        style={styles.categoryItemText}
      >
        {item.name}
      </Animated.Text>
      <Animated.View
        // source={{ uri: item.iconUrl }}
        sharedTransitionStyle={customTransitionLinear}
        style={styles.bgCategoryItem}
        entering={FadeIn.duration(500)}
        sharedTransitionTag={`category-frame-${item.id}`}
      />
      <Animated.View
        sharedTransitionTag={`category-bg-${item.id}`}
        sharedTransitionStyle={customTransition}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: palette.backgroundWhite,
            height: TOP_HEADER_HEIGHT + 32,
          },
        ]}
      />
      <Animated.View
        style={styles.bg}
        sharedTransitionTag={`general-bg`}
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
                duration: 1000,
                delay: (index + 1) * 150,
              }}
              key={category.id}
              style={styles.categoryItem}
            >
              <View style={{ width: '20%' }}>
                <Image
                  source={{ uri: category.iconUrl }}
                  style={{
                    width: 50,
                    height: 50,
                    resizeMode: 'contain',
                    backgroundColor: palette.skyBlue,
                    padding: 10,
                    borderRadius: 16,
                  }}
                />
              </View>
              <View style={{ width: '50%' }}>
                <Typography
                  variant="h5"
                  style={{ letterSpacing: 0.4, color: colors.textOnDark }}
                >
                  {category.name}
                </Typography>
              </View>
              <View style={{ width: '30%', alignItems: 'flex-end' }}>
                <ArrowSvg width={20} height={20} fill={`#82C8E5`} />
              </View>
            </AnimatedView>
          ))}
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
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
    // letterSpacing: .7,
    width: '80%',
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    marginTop: 20,
    top: -120,
    zIndex: 1000,
    position: 'absolute',
    right: 0,
    // scale: 1.1,
    // backgroundColor: 'red',
  },
  categoryItemImageIcon: {
    width: 30,
    height: 30,
    borderRadius: 16,
    overflow: 'hidden',
    // padding: 10,
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
    // backgroundColor: palette.backgroundWhite,
    // borderRadius: 32,
    paddingHorizontal: SPACING,
    overflow: 'hidden',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    backgroundColor: palette.white,
    marginBottom: 15,
  },
  bgCategoryItem: {
    // width: 56,
    height: 40,
    resizeMode: 'contain',
    borderRadius: 10,
    // backgroundColor: palette.backgroundWhite,
    backgroundColor: 'red',
    position: 'absolute',
    width: '100%',
    top: -110,
    zIndex: 500,
  },
});
