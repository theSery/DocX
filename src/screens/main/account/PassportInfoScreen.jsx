import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function PassportInfoScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Passport info</Text>
      <Text style={styles.subtitle}>Passport details will appear here.</Text>
    </View>
  );
}
