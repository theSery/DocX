import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import UserSvg from '../../icons/UserSvg';
import PenSvg from '../../icons/PenSvg';
import { useThemedStyles } from '../../../hooks';
import GradientBackground from '../../GradientBackground';
import { ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT } from '../stackHeaderConstants';
import { Typography } from '../../typography';
import { palette } from '../../../theme';
import AccountHeader from './AccountHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const AccountStackHeader = ({
  onPress,
  title,
  subtitle,
  isBackButton = false,
  showSearch = true,
  collapsible = true,
}) => {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  return (
    <View style={{ height: ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT, }}>
      <StatusBar barStyle="light-content" />
      <GradientBackground
        isAccountScreen
        centered={false}
        gradientHeight={ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT}
      >

        <View style={[styles.container, { paddingTop: insets.top }]} >
          <AccountHeader onPress={onPress} title={title} isBackButton={isBackButton} />
          <View style={styles.infoContainer}>
            <View
              style={[styles.accountContainer]}
            >
              <View style={styles.userImageContainer}>
                <UserSvg width={45} height={45} />
                <View style={styles.userImageOverlay} >
                  <PenSvg width={16} height={16} fill={palette.mainBlue} />
                </View>
              </View>
              <View>
                <Typography variant="h3" style={{ color: palette.white, letterSpacing: 1.8 }}>Վարդուհի</Typography>
                <Typography variant="h3" style={{ color: palette.white, letterSpacing: 1.8, }}>Հարությունյան</Typography>
                <View style={styles.accountInfoContainer}>
                  <Typography style={{ color: palette.white, fontSize: 8, letterSpacing: 1.8 }}>Ֆիզիկական անձ</Typography>
                </View>
              </View>

            </View>

          </View>
        </View>

      </GradientBackground>
    </View>
  );
};

export default AccountStackHeader;


const createStyles = colors =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      // borderBottomLeftRadius: 24,
      // borderBottomRightRadius: 24,
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
      // padding: 16,
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
    infoContainer: {
      // marginTop: 24,
    },
    accountInfoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#00A88C',
      borderRadius: 8,
      width: '70%',
      marginTop: 3,
    },
  });
