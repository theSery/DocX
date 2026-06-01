import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AnimatedView, Typography } from '../../../components';
import { colors, FONT_FAMILY, palette } from '../../../theme';
import WalletSvg from '../../../components/icons/WalletSvg';
import PlusSvg from '../../../components/icons/PlusSvg';
import Chevron from '../../../components/icons/Chevron';
import AccountInfoSvg from '../../../components/icons/AccountInfoSvg';
import PasportSvg from '../../../components/icons/PasportSvg';
import SettingSvg from '../../../components/icons/SettingSvg';
import LockIconSbg from '../../../components/icons/LockIconSbg';

const ACCOUNT_MENU = [
  { label: 'Անձնական տվյալներ', 
    screen: 'ProfileInfo',
    icon: <AccountInfoSvg fill={colors.mainBlue} width={20} height={20} />,
  },
  { 
    label: 'Համալրել դրամապանակը', 
    screen: 'PassportInfo',
    icon: <PasportSvg fill={colors.mainBlue} width={20} height={20} />,
  },
  { 
    label: 'Գաղտնաբառ', 
    screen: 'PasswordChange',
    icon: <LockIconSbg fill={colors.mainBlue} width={20} height={20} />,
  },
];
const SECONDARY_MENU = [
  { 
    label: 'Կարգավորումներ', 
    screen: 'Settings',
    icon: <SettingSvg fill={colors.mainBlue} width={20} height={20} />,
  },
];
export function AccountScreen({ navigation }) {

  return (
    <ScrollView style={styles.screen}>
      <AnimatedView animation="fadeIn" duration={500} style={[styles.content]}>
        <View style={styles.balanceContainer}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <WalletSvg fill={palette.lightGray} width={50} height={50} />
            <Text style={styles.balanceText}>500֏</Text>
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
        <View style={{ width: '100%'}}>
          <Typography variant="h4" style={{ color: colors.textDisabled }}>
            Հաշիվ
          </Typography>
          <View style={{marginTop: 20}}>
          {ACCOUNT_MENU.map(item => (
            <Pressable
              key={item.screen}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              {item.icon}
              <Typography variant="h5">{item.label}</Typography>
              </View>
             
              <Chevron
              width={11}
              height={11}
              fill={colors.mainBlue}
            />
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ width: '100%', marginTop: 30}}>
          <Typography variant="h4" style={{ color: colors.textDisabled }}>
          Հաշվի կարգավորումներ
          </Typography>
          <View style={{marginTop: 20}}>
          {SECONDARY_MENU.map(item => (
            <Pressable
              key={item.screen}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              {item.icon}
              <Typography variant="h5">{item.label}</Typography>
              </View>
             
              <Chevron
              width={11}
              height={11}
              fill={colors.mainBlue}
            />
              </Pressable>
            ))}
          </View>
        </View>
      </AnimatedView>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },

  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
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
    fontFamily: FONT_FAMILY.Regular,
  },
  addBalanceButton: {
    backgroundColor: '#00A88C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
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
});
