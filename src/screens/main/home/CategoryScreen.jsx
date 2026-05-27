import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SPACING } from './components/CategoriesList';
import { AnimatedView } from '../../../components/animation/AnimatedView';
import Animated from 'react-native-reanimated';
import { HEIGHT, WIDTH, customTransition, customTransition2 } from '../../../utils/dimensions';
import { colors, FONT_FAMILY } from '../../../theme';
import { palette } from '../../../theme';
import { SearchComponent } from '../../../components/titleComponents/SearchComponent';
import { Typography } from '../../../components/typography/Typography';
import ArrowSvg from '../../../components/icons/ArrowSvg';

const TOP_HEADER_HEIGHT = HEIGHT * 0.3;

export function CategoryScreen({ route }) {
  // const styles = useMainScreenStyles();

  const { item } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: 'red'}}>
      <Animated.Image
        source={{ uri: item.iconUrl }}
        sharedTransitionStyle={customTransition2}
        style={styles.categoryItemImageIcon}
        sharedTransitionTag={`category-image-${item.id}`}
      />
      <Text
        // sharedTransitionTag={`category-text-${item.id}`}
        // sharedTransitionStyle={customTransition}
   
        style={styles.categoryItemText}
      >
        {item.name}
      </Text>

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
      {/* <SearchComponent /> */}
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
            style={{ flexDirection: 'column', justifyContent: 'space-evenly', flexWrap: 'wrap' }}
          >
            <SearchComponent />
            {item.subCategories?.map((category, index) => (
              <AnimatedView
                animation="fadeIn"
                animationConfig={{
                  duration: 1000,
                  delay: (index + 1) * 100,
                }}
                key={category.id}
                style={styles.categoryItem}
              >
                <View style={{ width: '20%' }}>
                  <Image
                    source={{ uri: category.iconUrl }}
                    style={{ width: 50, height: 50, resizeMode: 'contain', backgroundColor: palette.skyBlue, padding: 10, borderRadius: 16 }}
                  />
                </View>
                <View style={{ width: '50%' }}>
                  <Typography
                    variant="h5"
                    style={{ letterSpacing: .4, color: palette.gray }}
                  >
                    {category.name}
                  </Typography>
                </View>
                <View style={{ width: '30%', alignItems: 'flex-end' }}>
                  <ArrowSvg width={20} height={20} fill={`#82C8E5`} />
                </View>
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
  },
  categoryItemImageIcon: {
    width: 30,
    height: 30,
    borderRadius: 5,
    resizeMode: 'cover',
    position: 'absolute',
    left: 20,
    top: 25,
  },
  bg: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: 'blue',
    transform: [{ translateY: TOP_HEADER_HEIGHT * .21 }],
    borderRadius: 32,
    paddingHorizontal: SPACING,
  
    // paddingTop: 32 + SPACING, 
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
});
