import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AnimatedView, Typography } from '../../../components';
import {
  useGlobalStyles,
  useThemedStyles,
  useTheme,
  useToast,
} from '../../../hooks';
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
import { accountApi } from '../../../api';

const ACCOUNT_MENU = [
  {
    id: 1,
    label: 'Անձնական տվյալներ',
    screen: 'ProfileInfo',
    Icon: AccountInfoSvg,
  },
  {
    id: 2,
    label: 'Անձնագրային տվյալներ',
    screen: 'PassportInfo',
    requiresFaceId: true,
    Icon: PasportSvg,
  },
  {
    id: 3,
    label: 'Գաղտնաբառ',
    screen: 'ChangePassword',
    Icon: LockIconSbg,
  },
];

const SECONDARY_MENU = [
  {
    id: 1,
    label: 'Կարգավորումներ',
    screen: 'Settings',
    Icon: SettingSvg,
  },
  {
    id: 2,
    label: 'Պին կոդ',
    screen: 'PinCodeChange',
    Icon: PinCodeSvg,
  },
  {
    id: 3,
    label: 'Ստորագրություն',
    screen: 'Signature',
    Icon: SignatureSvg,
  },
  {
    id: 4,
    label: 'Ջնջել հաշիվը',
    screen: 'DeleteAccount',
    Icon: TrashSvg,
    muted: true,
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
  const { showToast } = useToast();

  const handleDeleteAccountPress = async () => {
    try {
      await accountApi.requestDeletionCode();
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Հաստատման կոդը ուղարկվել է Ձեր էլ-փոստին',
        type: 'success',
      });
      navigation.navigate('ConfirmPhoneCode', { purpose: 'delete_account' });
    } catch (error) {
      showToast({
        title: 'Կոդի ուղարկումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    }
  };

  const handleDeleteAccountConfirmPress = () => {
    showGlobalSheet({
      message: 'Դուք պատրաստվում եք ջնջել Ձեր հաշիվը',
      description:
        'Հաշիվը ջնջելով կորցնում եք հասանելիությունը բոլոր տվյալներին, Ձեր կողմից ստեղծված բոլոր փաստաթղթերին',
      actions: [
        { label: 'Ջնջել', destructive: true, onPress: handleDeleteAccountPress },
        { label: 'Չեղարկել' },
      ],
    });
  };

  const navigateToScreen = (screen, { requiresFaceId } = {}) => {
    if (requiresFaceId) {
      navigation.navigate('FaceIdUnlock', { nextScreen: screen });
      return;
    }
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={[globalStyles.screen, styles.screen]}>
      <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceRow}>
            {/* <WalletSvg fill={palette.lightGray} width={50} height={50} />
            <Typography variant="h1" style={styles.balanceText}>500֏</Typography> */}
          </View>

          {/* <Pressable
            onPress={() => navigation.navigate('Wallet')}
            style={styles.addBalanceButton}
          >
            <View style={styles.addBalanceContent}>
              <PlusSvg fill={palette.white} width={18} height={18} />
              <Typography variant="h5" style={styles.addBalanceText}>
                Համալրել
              </Typography>
            </View>
          </Pressable> */}
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
                onPress={() =>
                  navigateToScreen(item.screen, {
                    requiresFaceId: item.requiresFaceId,
                  })
                }
              >
                <View style={styles.menuItemRow}>
                  <item.Icon fill={colors.icons} width={20} height={20} />
                  <Typography variant="h5">{item.label}</Typography>
                </View>
                <Chevron width={11} height={11} fill={colors.icons} />
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
                onPress={() =>
                  item.id === 4
                    ? handleDeleteAccountConfirmPress()
                    : navigateToScreen(item.screen)
                }
              >
                <View style={styles.menuItemRow}>
                  <item.Icon
                    fill={item.muted ? colors.textDisabled : colors.icons}
                    width={20}
                    height={20}
                  />
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
