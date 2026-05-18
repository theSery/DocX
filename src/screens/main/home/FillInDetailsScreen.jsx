import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function FillInDetailsScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Fill in details</Text>
      <Text style={styles.subtitle}>Document details form will appear here.</Text>
    </View>
  );
}
