import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { SPACING } from './components/CategoriesList';
import { StaggeredAnimatedView } from '../../../components/animation';
import { CachedImage } from '../../../components/image';
import { TAB_BAR_HEIGHT, TOP_HEADER_HEIGHT, WIDTH } from '../../../utils/dimensions';
import { Typography } from '../../../components/typography/Typography';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import { useGlobalStyles, useHomeStackHeaderScrollHandler, useThemedStyles, useTheme } from '../../../hooks';
import { palette } from '../../../theme';

const LIST_PANEL_TOP = TOP_HEADER_HEIGHT * 0.1018;

export function CategoryScreen({ navigation, route }) {
  const { item } = route.params;
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { onScroll, onScrollViewLayout, onContentSizeChange } =
    useHomeStackHeaderScrollHandler();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = insets.bottom + TAB_BAR_HEIGHT + 24;

  return (
    <View style={styles.screen}>
      <View style={styles.bg}>
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
            <StaggeredAnimatedView
              key={category.id}
              index={index}
              style={[globalStyles.cardShadow, styles.categoryItem]}
            >
              <TouchableOpacity
                style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                onPress={() => navigation.navigate('SubCategoryScreen', { item: category.legalIssues, title: item.name, subtitle: category.name, iconUrl: item.iconUrl, categoryId: item.id, subCategoryId: category.id })}
              >
                <View style={styles.subCategoryIconWrap}>
                  <CachedImage
                    source={{ uri: category.iconUrl || item.iconUrl }}
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
            </StaggeredAnimatedView>
          ))}
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
      top: LIST_PANEL_TOP,
      bottom: 0,
      width: WIDTH,
      paddingHorizontal: SPACING,
      overflow: 'hidden',
    },
    categoryItem: {
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
      backgroundColor: palette.skyBlue,
      padding: 10,
      borderRadius: 16,
    },
    subCategoryName: {
      letterSpacing: 0.4,
    },
    subCategoryIconWrap: {
      width: '20%',
    },
    subCategoryTextWrap: {
      width: '60%',
    },
    subCategoryArrowWrap: {
      width: '20%',
      alignItems: 'flex-end',
      paddingRight: 10,
    },
  });
