import React from 'react';
import { StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import leftIconBg from '../../assets/images/leftIconBg.webp';
import ligtBlackButton from '../../assets/images/ligtBlackButton.webp';
import ArrowSvg from '../icons/ArrowSvg';
import { useTheme } from '../../hooks';

const BackButton = ({ onPress, isHome = false }) => {
  const { isDarkMode } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <ImageBackground
        source={isDarkMode ? ligtBlackButton : leftIconBg}
        style={styles.image}
        imageStyle={styles.imageInner}
        resizeMode="cover"
      >
        <ArrowSvg
          width={14}
          height={14}
          rotate={180}
          fill={isDarkMode ? '#FFFFFF' : '#01174D'}
        />
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 45,
    height: 45,
    borderRadius: 100,
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

export default BackButton;
