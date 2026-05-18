import { Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function DocumentsScreen() {
  const styles = useMainScreenStyles();

  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Documents</Text>
      <Text style={styles.subtitle}>Your documents will appear here.</Text>
    </View>
  );
}
