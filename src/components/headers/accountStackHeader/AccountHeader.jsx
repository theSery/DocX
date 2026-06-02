import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import ligtBlueButton from '../../../assets/images/ligtBlueButton.webp';
import { Typography } from '../../typography';
import { palette } from '../../../theme';
import { useThemedStyles } from '../../../hooks';
import LogoutSvg from '../../icons/LogoutSvg';
import ArrowSvg from '../../icons/ArrowSvg';
import { showGlobalSheet } from '../../GlobalSheet';

const LOGOUT_CONFIRMATION_MESSAGE =
  'Վստա՞հ եք, որ ցանկանում եք դուրս գալ հավելվածից։';

const createStyles = (colors) =>
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
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    logOut: {
      position: 'relative',
      width: '100%',
      height: 50,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
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
          <Pressable onPress={onPress} style={styles.logOut}>
            <Image
              source={ligtBlueButton}
              style={styles.image}
              resizeMode="contain"
            />
            <ArrowSvg
              fill={palette.white}
              width={20}
              height={20}
              rotate={180}
            />
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
          <Pressable onPress={handleLogoutPress} style={styles.logOut}>
            <Image
              source={ligtBlueButton}
              style={styles.image}
              resizeMode="contain"
            />
            <LogoutSvg fill={palette.white} width={20} height={20} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default AccountHeader;
