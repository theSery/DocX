import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function ChangePasswordScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Change password</Text>
      <Text style={styles.subtitle}>Password change form will appear here.</Text>
    </View>
  );
}
