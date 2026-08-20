import React from 'react';
import { StyleSheet, View } from 'react-native';
import UserSvg from '../../icons/UserSvg';
import PenSvg from '../../icons/PenSvg';
import { useGlobalStyles, useTheme, useThemedStyles } from '../../../hooks';
import GradientBackground from '../../GradientBackground';
import { ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT, ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT } from '../stackHeaderConstants';
import { Typography } from '../../typography';
import { palette } from '../../../theme';
import AccountHeader from './AccountHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchPersonalData,
  selectPersonalData,
  selectPersonalDataStatus,
} from '../../../store/slices/personalDataSlice';

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
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userImageOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: palette.accentBlue,
      borderRadius: 100,
      padding: 4,
      height: 32,
      width: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountInfoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      borderRadius: 8,
      width: '100%',
      marginTop: 3,
      paddingHorizontal: 10,
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
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const personalData = useAppSelector(selectPersonalData);
  const name = personalData?.name ?? '';
  const surname = personalData?.surname ?? '';

  return (
    <View
      collapsable={false}
      style={{
        height: isMinHeight ? ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT : ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT,
        overflow: 'hidden',
      }}>
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
                <GradientBackground
                  isLight={!isDarkMode}
                  // isReversed={!isDarkMode}
                  centered
                  gradientWidth={88}
                  gradientHeight={88}
                  gradientRadius={44}
                >
                  <UserSvg
                    width={45}
                    height={45}
                    fill={isDarkMode ? palette.white : palette.mainBlue}
                  />
                </GradientBackground>
              </View>
              <View>
                <Typography
                  variant="h3"
                  tone="onDark"
                  style={[styles.userName, isDarkMode && { color: palette.mainBlue }]}
                >
                  {name}
                </Typography>
                <Typography
                  variant="h3"
                  tone="onDark"
                  style={[styles.userName, isDarkMode && { color: palette.mainBlue }]}
                >
                  {surname}
                </Typography>
                {/* <View style={styles.accountInfoContainer}>
                  <Typography tone="onDark" style={styles.accountType}>
                    Ֆիզիկական անձ
                  </Typography>
                </View> */}
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
