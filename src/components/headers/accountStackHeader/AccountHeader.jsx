import React from 'react';
import { StyleSheet, View, ImageBackground, Pressable } from 'react-native';
import ligtBlueButton from '../../../assets/images/ligtBlueButton.webp';
import { Typography } from '../../typography';
import { palette } from '../../../theme';
import { useThemedStyles } from '../../../hooks';
import LogoutSvg from '../../icons/LogoutSvg';
import ArrowSvg from '../../icons/ArrowSvg';
import { showGlobalSheet } from '../../GlobalSheet';

const LOGOUT_CONFIRMATION_MESSAGE =
  'Վստա՞հ եք, որ ցանկանում եք դուրս գալ հավելվածից։';

const createStyles = () =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

    },
    backButtonContainer: {
      // width: '15%',
    },
    logoContainer: {
      alignItems: 'center',
    },
    button: {
      width: 45,
      height: 45,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageInner: {
      borderRadius: 100,
    },
    title: {
      color: palette.white,
      fontSize: 24,
    },
    titleCompact: {
      color: palette.white,
      fontSize: 16,
    },
  });

const AccountHeader = ({ onPress, onLogoutPress, title, isBackButton, isLogoutButton }) => {
  const styles = useThemedStyles(createStyles);

  const handleLogoutPress = () => {
    showGlobalSheet({
      message: LOGOUT_CONFIRMATION_MESSAGE,
      actions: [
        { label: 'Փակել' },
        { label: 'Դուրս գալ', destructive: true, onPress: onLogoutPress },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        {isBackButton ? (
          <Pressable onPress={onPress} style={styles.button}>
            <ImageBackground
              source={ligtBlueButton}
              style={styles.image}
              imageStyle={styles.imageInner}
              resizeMode="cover"
            >
              <ArrowSvg
                fill={palette.white}
                width={18}
                height={15}
                rotate={180}
              />
            </ImageBackground>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.logoContainer}>
        <Typography
          variant="h2"
          tone="onDark"
          style={isBackButton ? styles.titleCompact : styles.title}
        >
          {title}
        </Typography>
      </View>
      <View style={styles.backButtonContainer}>
        {isLogoutButton ? (
          <Pressable onPress={handleLogoutPress} style={styles.button}>
            <ImageBackground
              source={ligtBlueButton}
              style={styles.image}
              imageStyle={styles.imageInner}
              resizeMode="cover"
            >
              <LogoutSvg fill={palette.white} width={15} height={18} />
            </ImageBackground>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default AccountHeader;
