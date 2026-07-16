import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { BounceIn, FadeIn } from 'react-native-reanimated';
import { HEIGHT } from '../../../../utils/dimensions';
import ArrowSvg from '../../../../components/icons/ArrowSvg';
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
  const { colors } = useTheme();
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
                <Image
                  source={{ uri: item.iconUrl }}
                  style={styles.categoryItemImageIcon}
                />
                {/* <View style={styles.bgCategoryItem} /> */}
                <Text style={styles.categoryItemText}>{item.name}</Text>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

    },

  });