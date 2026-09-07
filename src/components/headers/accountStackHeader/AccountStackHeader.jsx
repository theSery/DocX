import React from 'react';
import { StyleSheet, View } from 'react-native';
import UserSvg from '../../icons/UserSvg';
import PenSvg from '../../icons/PenSvg';
import { useGlobalStyles, useIsCompactScreen, useTheme, useThemedStyles } from '../../../hooks';
import GradientBackground from '../../GradientBackground';
import {
  getAccountStackHeaderCollapsedHeight,
  getAccountStackHeaderExpandedHeight,
} from '../stackHeaderConstants';
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
    containerCompact: {
      marginBottom: 10,
    },
    accountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 25,
      width: '100%',
    },
    accountContainerCompact: {
      gap: 16,
    },
    userImageContainer: {
      width: 88,
      height: 88,
      borderRadius: 100,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userImageContainerCompact: {
      width: 68,
      height: 68,
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
    userNameCompact: {
      fontSize: 16,
      lineHeight: 22,
      letterSpacing: 0.8,
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
  const isCompactScreen = useIsCompactScreen();
  const insets = useSafeAreaInsets();
  const headerHeight = isMinHeight
    ? getAccountStackHeaderCollapsedHeight(isCompactScreen)
    : getAccountStackHeaderExpandedHeight(isCompactScreen);
  const avatarSize = isCompactScreen ? 68 : 88;
  const userIconSize = isCompactScreen ? 36 : 45;
  const personalData = useAppSelector(selectPersonalData);
  const name = personalData?.name ?? '';
  const surname = personalData?.surname ?? '';

  return (
    <View
      collapsable={false}
      style={{
        height: headerHeight,
        overflow: 'hidden',
      }}>
      <GradientBackground
        isAccountScreen
        centered={false}
        gradientHeight={headerHeight}
      >
        <View
          style={[
            globalStyles.fill,
            styles.container,
            isCompactScreen && styles.containerCompact,
            { paddingTop: insets.top },
          ]}
        >
          <AccountHeader
            onPress={onPress}
            onLogoutPress={onLogoutPress}
            title={title}
            isBackButton={isBackButton}
            isLogoutButton={isLogoutButton}
          />
          {!isMinHeight && (
          <View>
            <View style={[styles.accountContainer, isCompactScreen && styles.accountContainerCompact]}>
              <View style={[styles.userImageContainer, isCompactScreen && styles.userImageContainerCompact]}>
                <GradientBackground
                  isLight={!isDarkMode}
                  // isReversed={!isDarkMode}
                  centered
                  gradientWidth={avatarSize}
                  gradientHeight={avatarSize}
                  gradientRadius={avatarSize / 2}
                >
                  <UserSvg
                    width={userIconSize}
                    height={userIconSize}
                    fill={isDarkMode ? palette.white : palette.mainBlue}
                  />
                </GradientBackground>
              </View>
              <View>
                <Typography
                  variant="h3"
                  tone="onDark"
                  style={[
                    styles.userName,
                    isCompactScreen && styles.userNameCompact,
                    isDarkMode && { color: palette.mainBlue },
                  ]}
                >
                  {name}
                </Typography>
                <Typography
                  variant="h3"
                  tone="onDark"
                  style={[
                    styles.userName,
                    isCompactScreen && styles.userNameCompact,
                    isDarkMode && { color: palette.mainBlue },
                  ]}
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
