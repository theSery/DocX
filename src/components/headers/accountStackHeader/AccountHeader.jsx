import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from '../../typography';
import { palette } from '../../../theme';
import { useThemedStyles } from '../../../hooks';
import LogoutSvg from '../../icons/LogoutSvg';
import ArrowSvg from '../../icons/ArrowSvg';
import { showGlobalSheet } from '../../GlobalSheet';
import { GlassButtonContainer } from '../../buttons/GlassButtonContainer';

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
          <GlassButtonContainer onPress={onPress} height={50} width={50} variant="blue">
            <ArrowSvg fill={palette.white} width={17} height={17} rotate={180} />
          </GlassButtonContainer>
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
          <GlassButtonContainer
            onPress={handleLogoutPress}
            height={50}
            width={50}
            variant="blue"
            backgroundColor={'#1D3D81'}
          >
            <LogoutSvg fill={palette.white} width={17} height={17} />
          </GlassButtonContainer>
        ) : null}
      </View>
    </View>
  );
};

export default AccountHeader;
