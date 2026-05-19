import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Typography } from '../../../../components/typography';
import foldersImage from '../../../../assets/images/folders.webp';
import darkLogo from '../../../../assets/images/darkLogo.webp'

export function RenderItem({ index, x, item }) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const imageAnimationStyle = useAnimatedStyle(() => {
    const translateYAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [200, 0, -200],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: translateYAnimation }],
    };
  });



  return (
    <View style={[styles.itemContainer, {width: SCREEN_WIDTH}]}>
      <Image source={darkLogo} style={styles.logo} />

      <Animated.View style={imageAnimationStyle}>
        <Image source={foldersImage} style={styles.image} />
      </Animated.View>
      <Typography variant="h4" style={[styles.itemText, { color: '#002340', fontFamily: 'Poppins-Regular', letterSpacing: 2.4}]}>
        {item.text}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    width: '100%',
    height: '70%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    // paddingBottom: 24,
  },
  image: {
    width: 280,
    height: 250,
  },
  itemText: {
    textAlign: 'center',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  logo: {
    height: 58,
    width: 250,
  },
  circleContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
