import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AccountScreen,
  ChangePasswordScreen,
  PassportInfoScreen,
  PinCodeChangeScreen,
  ProfileInfoScreen,
  SettingsScreen,
  SignatureScreen,
} from '../../screens/main/account';
import { useAuthSession, useStackScreenOptions } from '../../hooks';
import AccountStackHeader from '../../components/headers/accountStackHeader/AccountStackHeader';

const Stack = createNativeStackNavigator();

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
    <Stack.Navigator
      initialRouteName="AccountMain"
      screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen
        name="AccountMain"
        component={AccountScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Հաշիվ', isLogoutButton: true, isBackButton: false },
          logout,
        )}
      />
      <Stack.Screen
        name="ProfileInfo"
        component={ProfileInfoScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Անձնական տվյալներ', isLogoutButton: true, isBackButton: true },
          logout,
        )}
      />
      <Stack.Screen
        name="PassportInfo"
        component={PassportInfoScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Անձնագրային տվյալներ', isLogoutButton: true, isBackButton: true },
          logout,
        )}
      />
      <Stack.Screen
        name="PinCodeChange"
        component={PinCodeChangeScreen}
        options={{ ...nestedScreenOptions, title: 'Change PIN' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ ...nestedScreenOptions, title: 'Change password' }}
      />
      <Stack.Screen
        name="Signature"
        component={SignatureScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Ստորագրություն', isLogoutButton: false, isBackButton: true, isMinHeight: true },
        )}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          { title: 'Settings', isLogoutButton: true, isBackButton: true },
          logout,
        )}
      />
    </Stack.Navigator>
  );
}
