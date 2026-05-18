import { Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function ChangePasswordScreen() {
  const styles = useMainScreenStyles();
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Change password</Text>
      <Text style={styles.subtitle}>Password change form will appear here.</Text>
    </View>
  );
}
