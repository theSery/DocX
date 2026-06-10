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
import { authApi } from '../../api';
import { useAuth } from '../../contexts';
import { clearUserCredentials } from '../../utils/secureStorage';
import { useStackScreenOptions, useToast } from '../../hooks';
import AccountStackHeader from '../../components/headers/accountStackHeader/AccountStackHeader';

const Stack = createNativeStackNavigator();
const nestedScreenOptionsWithHeader = (
  nestedScreenOptions,
  { title,  isBackButton = false, isLogoutButton = false },
  onLogoutPress,
) => ({
  ...nestedScreenOptions,
  title,
  isBackButton,
  isLogoutButton,
  // headerShown: isBackButton,
  header: ({ navigation, options }) => (
    <AccountStackHeader
      onPress={() => navigation.goBack()}
      onLogoutPress={onLogoutPress}
      title={options.title}
      isBackButton={options.isBackButton}
      isLogoutButton={options.isLogoutButton}
    />
  ),
});
export function AccountStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();
  const { setIsSign } = useAuth();
  const { showToast } = useToast();

  const handleLogoutPress = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      showToast({
        title: 'Ելք ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      await clearUserCredentials();
      await setIsSign(false);
    }
  };

  return (
    <Stack.Navigator
      initialRouteName="AccountMain"
      screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="AccountMain" component={AccountScreen} 
      options={nestedScreenOptionsWithHeader(nestedScreenOptions, { title: 'Հաշիվ', isLogoutButton: true, isBackButton: false }, handleLogoutPress)} />
      <Stack.Screen
        name="ProfileInfo"
        component={ProfileInfoScreen}

      options={nestedScreenOptionsWithHeader(nestedScreenOptions, { title: 'Անձնական տվյալներ', isLogoutButton: true, isBackButton: true }, handleLogoutPress)} />
      <Stack.Screen
        name="PassportInfo"
        component={PassportInfoScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, { title: 'Անձնագրային տվյալներ', isLogoutButton: true, isBackButton: true }, handleLogoutPress)} />
      {/* /> */}
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
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, { title: 'Signature' , isLogoutButton: true, isBackButton: true }, handleLogoutPress)}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, { title: 'Settings' , isLogoutButton: true, isBackButton: true }, handleLogoutPress)}
      />
    </Stack.Navigator>
  );
}
