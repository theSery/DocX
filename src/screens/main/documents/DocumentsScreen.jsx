import { Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function DocumentsScreen() {
  const styles = useMainScreenStyles();
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Files</Text>
      <Text style={styles.subtitle}>Uploaded files will appear here.</Text>
    </View>
  );
}

