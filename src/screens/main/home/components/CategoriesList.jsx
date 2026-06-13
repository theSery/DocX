import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { BounceIn, FadeIn } from 'react-native-reanimated';

import {
  WIDTH,
  HEIGHT,
  customTransition,
  customTransitionLinear,
} from '../../../../utils/dimensions';
import { Typography } from '../../../../components';
import ArrowSvg from '../../../../components/icons/ArrowSvg';
import { FONT_FAMILY } from '../../../../theme';
import {
  useGlobalStyles,
  useHomeStackHeaderScrollHandler,
  useThemedStyles,
  useTheme,
} from '../../../../hooks';
import { useIsFocused } from '@react-navigation/native';

export const SPACING = 10;
export const ITEM_HEIGHT = HEIGHT * 0.2;



export function CategoriesList({
  navigation,
  categories,
  collapsibleHeader = true,
}) {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const { onScroll, onScrollViewLayout, onContentSizeChange } =
    useHomeStackHeaderScrollHandler(collapsibleHeader);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={categories}
        onScroll={onScroll}
        onLayout={onScrollViewLayout}
        onContentSizeChange={onContentSizeChange}
        scrollEventThrottle={collapsibleHeader ? 16 : undefined}
        contentContainerStyle={styles.contentContainer}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => {
          const enterDuration = 500;
          const enterDelay = (index + 1) * 200;

          return (
          <TouchableOpacity
            style={[globalStyles.cardShadow, styles.categoryItem]}
            onPress={() => navigation.navigate('Category', { item })}
          >
            <Animated.View
              style={styles.categoryItemImage}
              entering={FadeIn.duration(enterDuration).delay(enterDelay)}
            >
              <View style={styles.categoryItemHeaderRow}>
                <Animated.Image
                  source={{ uri: item.iconUrl }}
                  sharedTransitionStyle={customTransitionLinear}
                  style={styles.categoryItemImageIcon}
                  sharedTransitionTag={`category-image-${item.id}-${isFocused}`}
                />
                <Animated.View
                  sharedTransitionStyle={customTransitionLinear}
                  style={styles.bgCategoryItem}
                  sharedTransitionTag={`category-frame-${item.id}-${isFocused}`}
                />
                <Animated.Text
                  sharedTransitionTag={`category-text-${item.id}-${isFocused}`}
                  sharedTransitionStyle={customTransitionLinear}
                  style={styles.categoryItemText}
                >
                  {item.name}
                </Animated.Text>
              </View>
              <View style={styles.categoryItemFooterRow}>
                <Typography
                  variant="h6"
                  tone="secondary"
                  style={styles.categoryItemDescription}
                >
                  Երևանի քաղաքապետարանի կողմից տրամադրվող ակտեր
                </Typography>
                <Animated.View
                  entering={BounceIn.duration(enterDuration + 100).delay(enterDelay)}
                >
                  <ArrowSvg width={20} height={20} fill={colors.iconAccent} />
                </Animated.View>
              </View>
            </Animated.View>
          </TouchableOpacity>
          );
        }}
      />
      <Animated.View
        style={styles.bg}
        sharedTransitionTag={`general-bg-${isFocused}`}
        sharedTransitionStyle={customTransition}
      />
    </View>
  );
}


const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    categoryItemImage: {
      flex: 1,
      padding: SPACING,
    },
    categoryItemText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.medium,
      color: colors.text,
      letterSpacing: 0.7,
      width: '80%',
    },
    categoryItemImageIcon: {
      width: 56,
      height: 56,
      resizeMode: 'contain',
      borderRadius: 10,
    },
    bgCategoryItem: {
      height: 60,
      resizeMode: 'contain',
      borderRadius: 10,
      position: 'absolute',
      width: '100%',
      zIndex: -1000,
    },
    bg: {
      position: 'absolute',
      width: WIDTH,
      height: HEIGHT,
      transform: [{ translateY: HEIGHT }],
      borderRadius: 32,
    },
    categoryItem: {
      marginBottom: SPACING,
      borderRadius: 24,
      backgroundColor: colors.pureWhite,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      padding: SPACING,
    },
    contentContainer: {
      padding: SPACING,
marginHorizontal: 5,
    },
    categoryItemHeaderRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    categoryItemFooterRow: {
      flex: 1,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING,
    },
    categoryItemDescription: {
      width: '80%',
      letterSpacing: 0.4,
    },
  });