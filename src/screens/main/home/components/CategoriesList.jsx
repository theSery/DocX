import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { HEIGHT } from '../../../../utils/dimensions';
import ArrowSvg from '../../../../components/icons/ArrowSvg';
import { CachedImage } from '../../../../components/image';
import { StaggeredAnimatedView } from '../../../../components/animation';
import { FONT_FAMILY } from '../../../../theme';
import {
  useGlobalStyles,
  useHomeStackHeaderScrollHandler,
  useThemedStyles,
  useTheme,
} from '../../../../hooks';

export const SPACING = 10;
export const ITEM_HEIGHT = HEIGHT * 0.2;

export function CategoriesList({
  navigation,
  categories,
  collapsibleHeader = true,
}) {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { colors, isDarkMode } = useTheme();
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
     
                <Text style={styles.categoryItemText}>{item.name}</Text>
                <View style={styles.categoryItemArrowContainer}>
                  <ArrowSvg width={20} height={20} fill={colors.iconAccent} />
                </View>
              </View>
            </TouchableOpacity>
          </StaggeredAnimatedView>
        )}
      />
      <Image
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
    categoryItemImage: {
      flex: 1,
      padding: SPACING,
    },
    categoryItemImageContainer: {
      width: "15%",
      // height: 20,
      justifyContent: 'center',
      alignItems: 'center',

    },
    categoryItemText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.medium,
      color: colors.text,
      letterSpacing: 0.9,
      width: '75%',
    },
    categoryItemImageIcon: {
      width: 56,
      height: 56,
      resizeMode: 'contain',
      borderRadius: 10,
      // marginLeft: 10,
      marginRight: 10,
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
