import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function DocumentCreateScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Create document</Text>
      <Text style={styles.subtitle}>Document creation flow will appear here.</Text>
    </View>
  );
}
