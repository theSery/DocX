import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Typography } from '../../../../components/typography';
import darkLogo from '../../../../assets/images/darkLogo.webp';
import { AnimatedView } from '../../../../components';

export function RenderItem({ index, x, item, layout, slideHeight }) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const compact = Boolean(layout?.compact);
  const imageTravel = compact ? layout.slideImage.height * 0.45 : 200;

  const imageAnimationStyle = useAnimatedStyle(() => {
    const translateYAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [imageTravel, 0, -imageTravel],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: translateYAnimation }],
    };
  });

  return (
    <AnimatedView
      animation="fadeIn"
      duration={300}
      style={[
        styles.itemContainer,
        { width: SCREEN_WIDTH },
        compact && {
          height: slideHeight || undefined,
          paddingBottom: layout.controlsReserve,
        },
      ]}
    >
      <Image
        source={darkLogo}
        style={compact ? layout.logo : styles.logo}
        resizeMode={compact ? 'contain' : undefined}
      />

      {compact ? (
        <View style={styles.imageSlot}>
          <Animated.View
            style={[
              styles.imageFrame,
              imageAnimationStyle,
              {
                width: layout.slideImage.width,
                height: layout.slideImage.height,
                maxWidth: '100%',
                maxHeight: '100%',
              },
            ]}
          >
            <Image
              source={item.image}
              resizeMode="contain"
              style={styles.compactImage}
            />
          </Animated.View>
        </View>
      ) : (
        <Animated.View style={imageAnimationStyle}>
          <Image source={item.image} style={styles.image} />
        </Animated.View>
      )}
      <Typography
        variant="h4"
        style={[
          compact ? styles.compactText : styles.itemText,
          compact ? layout.itemText : null,
          {
            color: '#002340',
            fontFamily: 'Poppins-Regular',
            ...(compact
              ? null
              : {
                  letterSpacing: 2.4,
                  fontSize: 20,
                }),
          },
        ]}
      >
        {item.text}
      </Typography>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    width: '100%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  image: {
    width: 200,
    height: 400,
  },
  itemText: {
    textAlign: 'center',
    marginBottom: 10,
    marginHorizontal: 50,
  },
  logo: {
    height: 58,
    width: 250,
  },
  compactContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  imageSlot: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactText: {
    flexShrink: 0,
    textAlign: 'center',
    marginBottom: 4,
  },
});
