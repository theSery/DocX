import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function DocumentsScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Documents</Text>
      <Text style={styles.subtitle}>Your documents will appear here.</Text>
    </View>
  );
}
