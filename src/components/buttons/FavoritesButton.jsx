import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

import darkFav from '../../assets/images/darkFav.webp';
import lightFav from '../../assets/images/lightFav.webp';
import { useTheme } from '../../hooks';

/**
 * Circular favorites control for HomeStackHeader.
 * Theme-aware assets from examples/DarlFav.png and examples/LigthFav.png
 * (same Image-button approach as BackButton).
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
      <Image
        source={isDarkMode ? darkFav : lightFav}
        style={styles.image}
        resizeMode="contain"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
});

export default FavoritesButton;
