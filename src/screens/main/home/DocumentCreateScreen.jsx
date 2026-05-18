import { Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function DocumentCreateScreen() {
  const styles = useMainScreenStyles();
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Create document</Text>
      <Text style={styles.subtitle}>Document creation flow will appear here.</Text>
    </View>
  );
}
