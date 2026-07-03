import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AccountScreen,
  ChangePasswordScreen,
  PassportInfoScreen,
  PinCodeChangeScreen,
  ProfileInfoScreen,
  ConfirmPhoneCodeScreen,
  SettingsScreen,
  SignatureScreen,
  WalletScreen,
} from '../../screens/main/account';
import { useAuthSession, useStackScreenOptions } from '../../hooks';
import AccountStackHeader from '../../components/headers/accountStackHeader/AccountStackHeader';

const Account = createNativeStackNavigator();

const nestedScreenOptionsWithHeader = (
  nestedScreenOptions,
  { title, isBackButton = false, isLogoutButton = false, isMinHeight = false },
  onLogoutPress,
) => ({
  ...nestedScreenOptions,
  title,
  isBackButton,
  isLogoutButton,
  isMinHeight,
  headerShown: true,
  contentStyle: { zIndex: 0 },
  header: ({ navigation, options }) => (
    <AccountStackHeader
      onPress={() => navigation.goBack()}
      onLogoutPress={onLogoutPress}
      title={options.title}
      isBackButton={options.isBackButton}
      isLogoutButton={options.isLogoutButton}
      isMinHeight={options.isMinHeight}
    />
  ),
});

export function AccountStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();
  const { logout } = useAuthSession();

  return (
    <Account.Navigator
      initialRouteName="AccountMain"
      screenOptions={{ headerShown: false, animation: 'default' }}>
      <Account.Screen
        name="AccountMain"
        component={AccountScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Հաշիվ', isLogoutButton: true, isBackButton: false },
          logout,
        )}
      />
      <Account.Screen
        name="ProfileInfo"
        component={ProfileInfoScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Անձնական տվյալներ', isLogoutButton: true, isBackButton: true },
          logout,
        )}
      />
      <Account.Screen
        name="ConfirmPhoneCode"
        component={ConfirmPhoneCodeScreen}
        options={{ headerShown: false }}
      />
      <Account.Screen
        name="PassportInfo"
        component={PassportInfoScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Անձնագրային տվյալներ', isLogoutButton: true, isBackButton: true },
          logout,
        )}
      />
      <Account.Screen
        name="PinCodeChange"
        component={PinCodeChangeScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'PIN կոդ', isLogoutButton: true, isBackButton: true , isMinHeight: true},
          logout,
        )}
      />
      <Account.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Գաղտնաբառ', isLogoutButton: false, isBackButton: true },
        )}
      />
      <Account.Screen
        name="Wallet"
        component={WalletScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Դրամապանակ', isLogoutButton: false, isBackButton: true, isMinHeight: true },
        )}
      />
      <Account.Screen
        name="Signature"
        component={SignatureScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Ստորագրություն', isLogoutButton: false, isBackButton: true, isMinHeight: true },
        )}
      />
      <Account.Screen
        name="Settings"
        component={SettingsScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Կարգավորումներ', isLogoutButton: true, isBackButton: true, isMinHeight: true },
          logout,
        )}
      />
    </Account.Navigator>
  );
}
