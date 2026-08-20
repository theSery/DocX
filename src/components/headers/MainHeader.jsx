import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import BackButton from '../buttons/BackButton';
import darkLogo from '../../assets/images/darkLogo.webp';
import whiteLogo from '../../assets/images/whiteLogo.webp';
import { useTheme, useThemedStyles } from '../../hooks';

const MainHeader = ({ onPress, isHome = false, rightAction = null }) => {
  const styles = useThemedStyles(createStyles);
  const { isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onPress ? (
             <BackButton onPress={onPress} isHome={isHome} />
        ) : null}
      </View>
      <View style={styles.logoContainer}>
        <Image
          source={isDarkMode ? whiteLogo : darkLogo}
          style={styles.logo}
          resizeMode="cover"
        />
      </View>
      <View style={styles.side}>
        {rightAction}
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
      width: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: {
      flex: 1,
      alignItems: 'center',
    },
    logo: {
      width: '100%',
      height: 45,
      maxWidth: 180,
      minWidth: 140,
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
