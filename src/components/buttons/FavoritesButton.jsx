import React from 'react';
import { ImageBackground, Pressable, StyleSheet } from 'react-native';

import lightBlueButton from '../../assets/images/ligtBlueButton.webp';
import ligtBlackButton from '../../assets/images/ligtBlackButton.webp';
import StarOutlineSvg from '../icons/StarOutlineSvg';
import { useTheme } from '../../hooks';

/**
 * Circular favorites control for HomeStackHeader.
 * Same ImageBackground + SVG approach as BackButton.
 */
const FavoritesButton = ({ onPress }) => {
  const { isDarkMode } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Favorites"
      style={styles.pressable}
    >
      <ImageBackground
        source={isDarkMode ? ligtBlackButton : lightBlueButton}
        style={styles.image}
        imageStyle={styles.imageInner}
        resizeMode="cover"
      >
        <StarOutlineSvg
          width={19}
          height={18}
          fill="#FFFFFF"
        />
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageInner: {
    borderRadius: 100,
  },
});

export default FavoritesButton;
