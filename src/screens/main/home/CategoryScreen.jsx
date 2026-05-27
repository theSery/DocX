import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';

import { SPACING } from './components/CategoriesList';
import { AnimatedView } from '../../../components/animation/AnimatedView';
import Animated from 'react-native-reanimated';
import { HEIGHT, WIDTH, customTransition } from '../../../utils/dimensions';
import { colors, FONT_FAMILY } from '../../../theme';
import { palette } from '../../../theme';

const TOP_HEADER_HEIGHT = HEIGHT * 0.3;
// const customTransition = SharedTransition.duration(550).easing(Easing.bezier(0.25, 0.1, 0.25, 1.0));
const categories = [
  {
    id: 1,
    name: 'Category 1',
    description: 'Category 1 description',
    image: require('../../../assets/images/folders.webp'),
    backgroundColor: 'red',
  },

  {
    id: 2,
    name: 'Category 2',
    description: 'Category 2 description',
    image: require('../../../assets/images/emailCheck.webp'),
    backgroundColor: 'blue',
  },
  {
    id: 3,
    name: 'Category 3',
    description: 'Category 3 description',
    image: require('../../../assets/images/folders.webp'),
    backgroundColor: 'green',
  },
];
export function CategoryScreen({ route }) {
  // const styles = useMainScreenStyles();

  const { item } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: 'red' }}>
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
      <Animated.View
        sharedTransitionTag={`category-bg-${item.id}`}
        sharedTransitionStyle={customTransition}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: item.backgroundColor,
            height: TOP_HEADER_HEIGHT + 32,
          },
        ]}
      />

      <Animated.Image
        source={{ uri: item.iconUrl }}
        sharedTransitionStyle={customTransition}
        style={styles.categoryItemImageIcon}
        sharedTransitionTag={`category-image-${item.id}`}
      />
      <Animated.View
        style={styles.bg}
        sharedTransitionTag={`general-bg`}
        sharedTransitionStyle={customTransition}
      >
        <ScrollView>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}
          >
            {categories.map((category, index) => (
              <AnimatedView
                animation="bounceIn"
                animationConfig={{
                  duration: 1000,
                  delay: (index + 1) * 100,
                }}
                key={category.id}
                style={{
                  backgroundColor: category.backgroundColor,
                  height: 70,
                  width: 70,
                  borderRadius: 10,
                }}
              >
                <Image
                  source={category.image}
                  style={{ width: 50, height: 50, resizeMode: 'contain' }}
                />
              </AnimatedView>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  categoryItemText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.medium,
    color: colors.text,
    letterSpacing: .7,
    width: '80%',
    marginLeft: 'auto',
    marginRight: 20,
    marginTop: 20,
    // textAlign: 'center',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  categoryItemImageIcon: {
    width: 30,
    height: 30,
    borderRadius: 5,
    resizeMode: 'cover',
    position: 'absolute',
    left: 20,
    top: 25,
    // top: TOP_HEADER_HEIGHT - ITEM_HEIGHT * 0.8,
    // right: SPACING,
  },
  bg: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: 'white',
    transform: [{ translateY: TOP_HEADER_HEIGHT }],
    borderRadius: 32,
    padding: SPACING,
    paddingTop: 32 + SPACING,
  },
});
