import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import BackButton from '../buttons/BackButton';
import darkLogo from '../../assets/images/darkLogo.webp';
import whiteLogo from '../../assets/images/whiteLogo.webp';
import { useResponsiveLayout, useTheme, useThemedStyles } from '../../hooks';

const MainHeader = ({ onPress, isHome = false, rightAction = null }) => {
  const styles = useThemedStyles(createStyles);
  const layout = useResponsiveLayout();
  const { isDarkMode } = useTheme();
  const sideSize = layout.compact ? layout.buttonHeight : 50;

  return (
    <View style={styles.container}>
      <View style={[styles.side, layout.compact && { width: sideSize }]}>
        {onPress ? (
          <BackButton
            onPress={onPress}
            isHome={isHome}
            size={layout.compact ? layout.buttonHeight : 40}
          />
        ) : <View style={{ width: 45, height: 45 }} />}
      </View>
      <View style={styles.logoContainer}>
        <Image
          source={isDarkMode ? whiteLogo : darkLogo}
          style={layout.compact ? styles.logoCompact : styles.logo}
          resizeMode={layout.compact ? 'contain' : 'contain'}
        />
      </View>
      <View style={[styles.side, layout.compact && { width: sideSize }]}>
        {rightAction ? rightAction : <View style={{ width: 45, height: 45 }} />}
      </View>
    </View>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

    },
    side: {
      // width: 50,
      alignItems: 'center',
      justifyContent: 'center',

    },
    logoContainer: {
      flex: 1,
      alignItems: 'center',
    },
    logo: {
      width: '100%',
      height: 35,
      // maxWidth: 180,
      // minWidth: 140,
    },
    logoCompact: {
      width: '100%',
      height: 34,
      maxWidth: 140,
      minWidth: 110,
    },
    sideButton: {
      width: 4,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
  });

export default MainHeader;
