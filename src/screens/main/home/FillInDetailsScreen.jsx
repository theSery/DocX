import { Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function FillInDetailsScreen() {
  const styles = useMainScreenStyles();
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Fill in details</Text>
      <Text style={styles.subtitle}>Document details form will appear here.</Text>
    </View>
  );
}
