import React from 'react';
import { StyleSheet, View, ImageBackground, Pressable } from 'react-native';
import ligtBlueButton from '../../../assets/images/ligtBlueButton.webp';
import { Typography } from '../../typography';
import { palette } from '../../../theme';
import { useIsCompactScreen, useTheme, useThemedStyles } from '../../../hooks';
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
      width: '15%',
      
    },
    logoContainer: {
      width: '68%',
      alignItems: 'center',
    },
    button: {
      width: 45,
      height: 45,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonCompact: {
      width: 40,
      height: 40,
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
      fontSize: 22,
      lineHeight: 32,
    },
    titleCompact: {
      color: palette.white,
      fontSize: 18,
      lineHeight: 20,
      textAlign: 'center',
    },
    titleSmall: {
      fontSize: 20,
      lineHeight: 24,
    },
    titleCompactSmall: {
      fontSize: 16,
      lineHeight: 20,
    },
  });

const AccountHeader = ({ onPress, onLogoutPress, title, isBackButton, isLogoutButton }) => {
  const styles = useThemedStyles(createStyles);
  const { isDarkMode } = useTheme();
  const isCompactScreen = useIsCompactScreen();
  const titleColor = isDarkMode ? palette.mainBlue : palette.white;
  const arrowSize = isCompactScreen ? 16 : 18;
  const logoutWidth = isCompactScreen ? 13 : 15;
  const logoutHeight = isCompactScreen ? 16 : 18;

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
      <View style={[styles.backButtonContainer, {alignItems: 'flex-start',}]}>
        {isBackButton ? (
          <Pressable
            onPress={onPress}
            style={[styles.button, isCompactScreen && styles.buttonCompact]}
          >
            <ImageBackground
              source={ligtBlueButton}
              style={styles.image}
              imageStyle={styles.imageInner}
              resizeMode="cover"
            >
              <ArrowSvg
                fill={palette.white}
                width={arrowSize}
                height={isCompactScreen ? 13 : 15}
                rotate={180}
              />
            </ImageBackground>
          </Pressable>
        ) : <View style={{ width: 45, height: 45 }} />}
      </View>
      <View style={styles.logoContainer}>
        <Typography
          variant="h2"
          tone="onDark"
          style={[
            isBackButton ? styles.titleCompact : styles.title,
            isCompactScreen && (isBackButton ? styles.titleCompactSmall : styles.titleSmall),
            { color: titleColor },
          ]}
        >
          {title}

        </Typography>
      </View>
      <View style={[styles.backButtonContainer, {alignItems: 'flex-end',}]}>
        {isLogoutButton ? (
          <Pressable
            onPress={handleLogoutPress}
            style={[styles.button, isCompactScreen && styles.buttonCompact]}
          >
            <ImageBackground
              source={ligtBlueButton}
              style={styles.image}
              imageStyle={styles.imageInner}
              resizeMode="cover"
            >
              <LogoutSvg fill={palette.white} width={logoutWidth} height={logoutHeight} />
            </ImageBackground>
          </Pressable>
        ) : <View style={{ width: 45, height: 45 }} />}
      </View>
    </View>
  );
};

export default AccountHeader;
