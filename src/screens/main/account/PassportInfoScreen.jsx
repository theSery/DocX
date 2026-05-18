import { Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function PassportInfoScreen() {
  const styles = useMainScreenStyles();
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Passport info</Text>
      <Text style={styles.subtitle}>Passport details will appear here.</Text>
    </View>
  );
}
