import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMainScreenStyles } from '../../../hooks';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { Categories, ITEM_HEIGHT, SPACING } from './components/Categories';
import { AnimatedView } from '../../../components/animation/AnimatedView';
import Animated, { Easing, SharedTransition } from 'react-native-reanimated';
const TOP_HEADER_HEIGHT = Dimensions.get('window').height * 0.3;
const customTransition = SharedTransition.duration(550).easing(Easing.bezier(0.25, 0.1, 0.25, 1.0));
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
    <View style={{ flex: 1 }}>
      <Animated.View style={{  }} sharedTransitionTag={`title-container`}    sharedTransitionStyle={customTransition}>
      <ContentTiltes
        title="Բաժիններ"
          subtitle="Ընտրեք բողոքարկվող փաստաթղթի տեսակը"
      />
      </Animated.View>
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
      <Animated.Text style={styles.categoryItemText} sharedTransitionTag={`category-text-${item.id}`}    sharedTransitionStyle={customTransition}>{item.name}</Animated.Text>

      <Animated.Image source={item.image}
      sharedTransitionStyle={customTransition}
      style={styles.categoryItemImageIcon} sharedTransitionTag={`category-image-${item.id}`} />
      <Animated.View style={styles.bg} sharedTransitionTag={`general-bg`}    sharedTransitionStyle={customTransition}>
        <ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
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
    fontWeight: 'bold',
    color: 'black',
    position: 'absolute',
    top: TOP_HEADER_HEIGHT - SPACING * 3,
    left: SPACING,
  },
  categoryItemImageIcon: {
    width: ITEM_HEIGHT * 0.8,
    height: ITEM_HEIGHT * 0.8,
    resizeMode: 'contain',
    position: 'absolute',
    top: TOP_HEADER_HEIGHT - ITEM_HEIGHT * 0.8,
    right: SPACING,
  },
  bg: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'white',
    transform: [{ translateY: TOP_HEADER_HEIGHT }],
    borderRadius: 32,
    padding: SPACING,
    paddingTop: 32 + SPACING,
  },
});
