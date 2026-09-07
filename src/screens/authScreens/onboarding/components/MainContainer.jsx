import { useEffect } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
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

export function MainContainer({ handlePress, layout }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: FADE_DURATION });
  }, [opacity]);


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
      style={[
        styles.container,
        layout.compact && layout.contentPaddingBottom > 0
          ? { paddingBottom: layout.contentPaddingBottom + 12 }
          : null,
      ]}
    >
      <Image
        source={whiteLogo}
        style={layout.compact ? layout.logo : styles.logo}
        resizeMode={layout.compact ? 'cover' : undefined}
      />
      {layout.compact ? (
        <View style={styles.imageSlot}>
          <Image
            source={foldersImage}
            resizeMode="contain"
            style={{
              width: layout.folders.width,
              height: layout.folders.height,
              maxHeight: '100%',
            }}
          />
        </View>
      ) : (
        <Image source={foldersImage} style={styles.image} />
      )}
      <Typography variant="h4" style={styles.copy}>
        Ընդամենը 3 քայլ և Դուք կստեղծեք Ձեր դիմումները, բողոքներն ու այլ
        փաստաթղթերը
      </Typography>
      <TouchableOpacity
        style={[styles.button, { height: layout.buttonHeight }]}
        onPress={onPress}>
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
  imageSlot: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 280,
    height: 230,
  },
  copy: {
    flexShrink: 0,
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
