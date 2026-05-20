import { useEffect } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {

  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import foldersImage from '../../../../assets/images/folders.webp';
import whiteLogo from '../../../../assets/images/whiteLogo.webp';
import { Typography } from '../../../../components/typography';
import { palette } from '../../../../theme';
import { runOnJS } from 'react-native-worklets';
import { AnimatedView } from '../../../../components';

const FADE_DURATION = 300;

export function MainContainer({ handlePress }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: FADE_DURATION });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const onPress = () => {
    opacity.value = withTiming(0, { duration: FADE_DURATION }, (finished) => {
      if (finished) {
        runOnJS(handlePress)();
      }
    });
  };

  return (
    <AnimatedView
    animation="fadeIn"
    duration={700}
    style={styles.container}
  >

      <Image source={whiteLogo} style={styles.logo} />
      <Image source={foldersImage} style={styles.image} />
      <Typography
        variant="h4"
        style={{ color: 'white', textAlign: 'center' }}>
        Ընդամենը 3 քայլ և Դուք կստեղծեք Ձեր դիմումները, բողոքներն ու այլ
        փաստաթղթերը
      </Typography>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Typography variant="h5" style={{ color: palette.mainBlue }}>
          Ինչպե՞ս
        </Typography>
      </TouchableOpacity>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: '5%',
  },
  logo: {
    height: 58,
    width: 250,
  },
  image: {
    width: 280,
    height: 230,
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 16,
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
