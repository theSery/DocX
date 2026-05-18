import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function FilesScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Files</Text>
      <Text style={styles.subtitle}>Uploaded files will appear here.</Text>
    </View>
  );
}
