import { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { personalDataApi } from '../../../api';
import { AnimatedView, Typography } from '../../../components';
import { useGlobalStyles, useThemedStyles, useTheme } from '../../../hooks';
import { FONT_FAMILY, palette } from '../../../theme';
import WalletSvg from '../../../components/icons/WalletSvg';
import PlusSvg from '../../../components/icons/PlusSvg';
import Chevron from '../../../components/icons/Chevron';
import AccountInfoSvg from '../../../components/icons/AccountInfoSvg';
import PasportSvg from '../../../components/icons/PasportSvg';
import SettingSvg from '../../../components/icons/SettingSvg';
import LockIconSbg from '../../../components/icons/LockIconSbg';
import SignatureSvg from '../../../components/icons/SignatureSvg';
import TrashSvg from '../../../components/icons/TrashSvg';
import PinCodeSvg from '../../../components/icons/PinCodeSvg';
import { showGlobalSheet } from '../../../components/GlobalSheet';

const ACCOUNT_MENU = [
  {
    id: 1,
    label: 'Անձնական տվյալներ',
    screen: 'ProfileInfo',
    icon: <AccountInfoSvg fill={palette.mainBlue} width={20} height={20} />,
  },
  {
    id: 2,
    label: 'Համալրել դրամապանակը',
    screen: 'PassportInfo',
    icon: <PasportSvg fill={palette.mainBlue} width={20} height={20} />,
  },
  {
    id: 3,
    label: 'Գաղտնաբառ',
    screen: 'PasswordChange',
    icon: <LockIconSbg fill={palette.mainBlue} width={20} height={20} />,
  },
];

const SECONDARY_MENU = [
  {
    id: 1,
    label: 'Կարգավորումներ',
    screen: 'Settings',
    icon: <SettingSvg fill={palette.mainBlue} width={20} height={20} />,
  },
  {
    id: 2,
    label: 'Պին կոդ',
    screen: 'PinCodeChange',
    icon: <PinCodeSvg fill={palette.mainBlue} width={20} height={20} />,
  },
  {
    id: 3,
    label: 'Ստորագրություն',
    screen: 'Signature',
    icon: <SignatureSvg fill={palette.mainBlue} width={20} height={20} />,
  },
  {
    id: 4,
    label: 'Ջնջել հաշիվը',
    screen: 'DeleteAccount',
    icon: <TrashSvg fill={palette.lightGray} width={20} height={20} />,
  },
];

const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
    },
    content: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      marginTop: 30,
    },
    balanceContainer: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingBottom: 20,
    },
    balanceRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    balanceText: {
      color: palette.lightGray,
      fontSize: 40,
      fontFamily: FONT_FAMILY.bold,
      letterSpacing: 1.8,
    },
    addBalanceContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    addBalanceText: {
      color: palette.white,
      fontSize: 14,
      fontFamily: FONT_FAMILY.regular,
    },
    addBalanceButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 16,
      width: '40%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      width: '100%',
    },
    sectionSpaced: {
      width: '100%',
      marginTop: 30,
    },
    menuList: {
      marginTop: 20,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.textDisabled,
      paddingHorizontal: 30,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    footer: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 8,
    },
  });

export function AccountScreen({ navigation }) {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  useEffect(() => {
    const controller = new AbortController();

    personalDataApi
      .getPersonalData({ signal: controller.signal })
      .then((response) => {
        console.log('personal-data:', response.data);
      })
      .catch((error) => {
        if (error.type !== 'cancel') {
          console.log('personal-data error:', error);
        }
      });

    return () => controller.abort();
  }, []);

  const handleDeleteAccountPress = () => {
    console.log('delete account');
  };

  const handleLogoutPress = () => {
    showGlobalSheet({
      message: 'Վստա՞հ եք, որ ցանկանում եք Ջնջել հաշիվը',
      actions: [
        { label: 'Փակել' },
        { label: 'Ջնջել հաշիվը', destructive: true, onPress: handleDeleteAccountPress },
      ],
    });
  };

  const navigateToScreen = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={[globalStyles.screen, styles.screen]}>
      <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceRow}>
            <WalletSvg fill={palette.lightGray} width={50} height={50} />
            <Typography variant="h1" style={styles.balanceText}>500֏</Typography>
          </View>

          <Pressable
            onPress={() => navigation.navigate('Wallet')}
            style={styles.addBalanceButton}
          >
            <View style={styles.addBalanceContent}>
              <PlusSvg fill={palette.white} width={18} height={18} />
              <Typography variant="h5" style={styles.addBalanceText}>
                Համալրել
              </Typography>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Typography variant="h4" tone="disabled">
            Հաշիվ
          </Typography>
          <View style={styles.menuList}>
            {ACCOUNT_MENU.map((item) => (
              <Pressable
                key={item.screen}
                style={[styles.menuItem, item.id === 3 && styles.menuItemLast]}
                onPress={() => navigateToScreen(item.screen)}
              >
                <View style={styles.menuItemRow}>
                  {item.icon}
                  <Typography variant="h5">{item.label}</Typography>
                </View>
                <Chevron width={11} height={11} fill={colors.mainBlue} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionSpaced}>
          <Typography variant="h4" tone="disabled">
            Հաշվի կարգավորումներ
          </Typography>
          <View style={styles.menuList}>
            {SECONDARY_MENU.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.menuItem, item.id === 4 && styles.menuItemLast]}
                onPress={() => (item.id === 4 ? handleLogoutPress() : navigateToScreen(item.screen))}
              >
                <View style={styles.menuItemRow}>
                  {item.icon}
                  <Typography
                    variant="h5"
                    tone={item.id === 4 ? 'disabled' : 'default'}
                  >
                    {item.label}
                  </Typography>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <Typography variant="h5" tone="secondary" style={styles.footer}>
          © 2026 - DOCX Բոլոր իրավունքները պաշտպանված են
        </Typography>
      </AnimatedView>
    </ScrollView>
  );
}
