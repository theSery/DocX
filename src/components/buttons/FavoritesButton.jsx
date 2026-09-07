import React from 'react';
import { ImageBackground, Pressable, StyleSheet } from 'react-native';

import leftIconBg from '../../assets/images/leftIconBg.webp';
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
        source={isDarkMode ? ligtBlackButton : leftIconBg}
        style={styles.image}
        imageStyle={styles.imageInner}
        resizeMode="cover"
      >
        <StarOutlineSvg
          width={17}
          height={16}
          fill={isDarkMode ? '#FFFFFF' : '#01174D'}
        />
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: 40,
    height: 40,
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
