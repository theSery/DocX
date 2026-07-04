import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import BackButton from '../buttons/BackButton';
import { GlassButtonContainer } from '../buttons/GlassButtonContainer';
import BellSvg from '../icons/BellSvg';
import StarSvg from '../icons/StarSvg';
import darkLogo from '../../assets/images/darkLogo.webp';
import { useThemedStyles } from '../../hooks';

const MainHeader = ({ onPress, isHome = false }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onPress ? (
             <BackButton onPress={onPress} isHome={isHome} />
        ) : (
          <GlassButtonContainer height={44}>
            <StarSvg />
          </GlassButtonContainer>
        )}
      </View>
      <View style={styles.logoContainer}>
        <Image source={darkLogo} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.side}>
        {!onPress ? (
          <GlassButtonContainer height={44}>
            <BellSvg />
          </GlassButtonContainer>
        ) : null}
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
      height: 40,
      maxWidth: 180,
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
