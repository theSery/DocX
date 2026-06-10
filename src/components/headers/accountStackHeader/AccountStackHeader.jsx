import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import UserSvg from '../../icons/UserSvg';
import PenSvg from '../../icons/PenSvg';
import { useGlobalStyles, useThemedStyles } from '../../../hooks';
import GradientBackground from '../../GradientBackground';
import { ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT, ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT } from '../stackHeaderConstants';
import { Typography } from '../../typography';
import { palette } from '../../../theme';
import AccountHeader from './AccountHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const createStyles = (colors) =>
  StyleSheet.create({
    // headerShell: {
    //   height: ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT,
    // },
    container: {
      paddingHorizontal: 16,
      flex: 1,
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    accountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 25,
      width: '100%',
    },
    userImageContainer: {
      width: 88,
      height: 88,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.skyBlue,
    },
    userImageOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: palette.white,
      borderRadius: 100,
      padding: 4,
    },
    accountInfoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      borderRadius: 8,
      width: '70%',
      marginTop: 3,
    },
    userName: {
      letterSpacing: 1.8,
    },
    accountType: {
      fontSize: 8,
      letterSpacing: 1.8,
    },
  });

const AccountStackHeader = ({
  onPress,
  onLogoutPress,
  title,
  isBackButton = false,
  isLogoutButton = false,
  isMinHeight = false,
}) => {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  return (
    <View style={{height: isMinHeight ? ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT : ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT}}>
      <StatusBar barStyle="light-content" />
      <GradientBackground
        isAccountScreen
        centered={false}
        gradientHeight={isMinHeight ? ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT : ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT}
      >
        <View style={[globalStyles.fill, styles.container, { paddingTop: insets.top }]}>
          <AccountHeader
            onPress={onPress}
            onLogoutPress={onLogoutPress}
            title={title}
            isBackButton={isBackButton}
            isLogoutButton={isLogoutButton}
          />
          {!isMinHeight && (
          <View>
            <View style={styles.accountContainer}>
              <View style={styles.userImageContainer}>
                <UserSvg width={45} height={45} />
                <View style={styles.userImageOverlay}>
                  <PenSvg width={16} height={16} fill={palette.mainBlue} />
                </View>
              </View>
              <View>
                <Typography variant="h3" tone="onDark" style={styles.userName}>
                  Վարդուհի
                </Typography>
                <Typography variant="h3" tone="onDark" style={styles.userName}>
                  Հարությունյան
                </Typography>
                <View style={styles.accountInfoContainer}>
                  <Typography tone="onDark" style={styles.accountType}>
                    Ֆիզիկական անձ
                  </Typography>
                </View>
              </View>
            </View>
          </View>
          )}
        </View>
      </GradientBackground>
    </View>
  );
};

export default AccountStackHeader;
