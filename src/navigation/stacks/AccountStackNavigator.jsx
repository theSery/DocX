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
import { useStackScreenOptions } from '../../hooks';
import AccountStackHeader from '../../components/headers/accountStackHeader/AccountStackHeader';

const Stack = createNativeStackNavigator();
const nestedScreenOptionsWithHeader = (
  nestedScreenOptions,
  { title, subtitle, showSearch = true, collapsible = true },
) => ({
  ...nestedScreenOptions,
  title,
  headerSubtitle: subtitle,
  headerShowSearch: showSearch,
  headerCollapsible: collapsible,
  headerShown: true,
  header: ({ navigation, options }) => (
    <AccountStackHeader
      onPress={() => navigation.goBack()}
      title={options.title}
      subtitle={options.headerSubtitle}
      showSearch={options.headerShowSearch}
      collapsible={options.headerCollapsible}
    />
  ),
});
export function AccountStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountMain" component={AccountScreen} options={nestedScreenOptionsWithHeader(nestedScreenOptions, { title: 'Հաշիվ' })} />
      <Stack.Screen
        name="ProfileInfo"
        component={ProfileInfoScreen}
        options={{ ...nestedScreenOptions, title: 'Profile info' }}
      />
      <Stack.Screen
        name="PassportInfo"
        component={PassportInfoScreen}
        options={{ ...nestedScreenOptions, title: 'Passport info' }}
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
        options={{ ...nestedScreenOptions, title: 'Signature' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ ...nestedScreenOptions, title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
