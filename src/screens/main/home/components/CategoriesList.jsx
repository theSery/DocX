import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ContentTiltes } from '../../../../components/titleComponents/ContentTiltles';
import { WIDTH, HEIGHT, customTransition } from '../../../../utils/dimensions';
import { Typography } from '../../../../components';
import ArrowSvg from '../../../../components/icons/ArrowSvg';
import { FONT_FAMILY, palette, colors } from '../../../../theme';
import { SearchComponent } from '../../../../components/titleComponents/SearchComponent';
export const SPACING = 10;
export const ITEM_HEIGHT = HEIGHT * 0.2;

export function CategoriesList({ navigation, categories }) {
  console.log('categories', categories);
  return (
    <View style={styles.container}>

      <FlatList
        data={categories}
        contentContainerStyle={styles.contentContainer}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => navigation.navigate('Category', { item })}
            >
              <View style={styles.categoryItemImage}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Animated.Image
                    source={{ uri: item.iconUrl }}
                    sharedTransitionStyle={customTransition}
                    style={styles.categoryItemImageIcon}
                    sharedTransitionTag={`category-image-${item.id}`}
                  />

                  <Animated.Text
                    sharedTransitionTag={`category-text-${item.id}`}
                    sharedTransitionStyle={customTransition}
                    variant="h5"
                    style={styles.categoryItemText}
                  >
                    {item.name}
                  </Animated.Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: SPACING,
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{
                      width: '80%',
                      letterSpacing: 0.4,
                      color: palette.gray,
                    }}
                  >
                    Երևանի քաղաքապետարանի կողմից տրամադրվող ակտեր
                  </Typography>
                  <ArrowSvg width={20} height={20} fill={`#82C8E5`} />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <Animated.View
        style={styles.bg}
        sharedTransitionTag={`general-bg`}
        sharedTransitionStyle={customTransition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.backgroundWhite,
    // backgroundColor: 'blue',
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
  bg: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: 'red',
    transform: [{ translateY: HEIGHT }],
    borderRadius: 32,
  },
  categoryItem: {
    marginBottom: SPACING,
    borderRadius: 24,
    borderColor: '#D9DFED',
    borderWidth: 1,
    padding: SPACING,
  },
  contentContainer: {
    padding: SPACING,
    marginHorizontal: SPACING,
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
});
