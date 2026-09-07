import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from '../../../../utils/dimensions';
import ArrowSvg from '../../../../components/icons/ArrowSvg';
import { CachedImage } from '../../../../components/image';
import { StaggeredAnimatedView } from '../../../../components/animation';
import { FONT_FAMILY, palette } from '../../../../theme';
import {
  useGlobalStyles,
  useHomeStackHeaderScrollHandler,
  useIsCompactScreen,
  useThemedStyles,
  useTheme,
} from '../../../../hooks';

export const SPACING = 10;

export function CategoriesList({
  navigation,
  categories,
  collapsibleHeader = true,
}) {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { colors, isDarkMode } = useTheme();
  const isCompactScreen = useIsCompactScreen();
  const insets = useSafeAreaInsets();
  const arrowSize = isCompactScreen ? 16 : 20;
  const { onScroll, onScrollViewLayout, onContentSizeChange } =
    useHomeStackHeaderScrollHandler(collapsibleHeader);
  const scrollBottomPadding = insets.bottom + TAB_BAR_HEIGHT + 24;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={categories}
        style={styles.list}
        onScroll={onScroll}
        onLayout={onScrollViewLayout}
        onContentSizeChange={onContentSizeChange}
        scrollEventThrottle={collapsibleHeader ? 16 : undefined}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: scrollBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => (
          <StaggeredAnimatedView
            index={index}
            style={[globalStyles.cardShadow, styles.categoryItem]}
          >
            <TouchableOpacity
              style={styles.categoryItemImage}
              onPress={() => navigation.navigate('Category', { item })}
            >
              <View style={styles.categoryItemHeaderRow}>
                <View style={styles.categoryItemImageContainer}>
                <CachedImage
                  source={{ uri: item.iconUrl }}
                  style={styles.categoryItemImageIcon}
                />
                </View>
     
                <Text
                  style={[
                    styles.categoryItemText,
                    isCompactScreen && styles.categoryItemTextCompact,
                  ]}
                >
                  {item.name}
                </Text>
                <View style={styles.categoryItemArrowContainer}>
                  <ArrowSvg width={arrowSize} height={arrowSize} fill={colors.iconAccent} />
                </View>
              </View>
            </TouchableOpacity>
          </StaggeredAnimatedView>
        )}
      />
      <Image
        pointerEvents="none"
        source={require('../../../../assets/images/Femidi.webp')}
        style={[styles.image, { opacity: isDarkMode ? 1 : 0.4 }]}
      />
    </View>
  );
}


const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    categoryItemImage: {
      flex: 1,
      padding: SPACING,
    },
    categoryItemImageContainer: {
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.skyBlue,
      borderRadius: 10,
      marginRight: 10,

    },
    categoryItemText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.medium,
      color: colors.text,
      letterSpacing: 0.9,
      width: '75%',
    },
    categoryItemTextCompact: {
      fontSize: 14,
      letterSpacing: 0.3,
    },
    categoryItemImageIcon: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
      // borderRadius: 10,
      // marginLeft: 10,
      // marginRight: 10,
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
// marginHorizontal: 5,
    },
    categoryItemHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

    },
    categoryItemArrowContainer: {
      // width: "5%",
      justifyContent: 'center',
      alignItems: 'center',

    },
    image: {
      width: '100%',
      height: 150,
      resizeMode: 'contain',
      position: 'absolute',
      bottom: 50,
      left: 0,
      right: 0,
      // top: 0,
      zIndex: -1000,
    },
  });
