import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../../../contexts';
import { mainScreenStyles as styles } from '../mainScreenStyles';

const ACCOUNT_MENU = [
  { label: 'Profile info', screen: 'ProfileInfo' },
  { label: 'Passport info', screen: 'PassportInfo' },
  { label: 'Change PIN', screen: 'PinCodeChange' },
  { label: 'Change password', screen: 'ChangePassword' },
  { label: 'Signature', screen: 'Signature' },
  { label: 'Settings', screen: 'Settings' },
];

export function AccountScreen({ navigation }) {
  const { setIsSign } = useAuth();

  const handleLogout = async () => {
    await setIsSign(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>Manage your profile and security</Text>
      <View>
        {ACCOUNT_MENU.map(item => (
          <Pressable
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.menuItemText}>{item.label}</Text>
            <Text style={styles.menuItemChevron}>›</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.dangerButton} onPress={handleLogout}>
        <Text style={styles.dangerButtonText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}
