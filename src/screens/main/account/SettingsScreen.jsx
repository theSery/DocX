import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function SettingsScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>App preferences will appear here.</Text>
    </View>
  );
}
