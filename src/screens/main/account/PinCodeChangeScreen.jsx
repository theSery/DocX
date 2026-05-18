import { Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function PinCodeChangeScreen() {
  const styles = useMainScreenStyles();
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Change PIN</Text>
      <Text style={styles.subtitle}>PIN change flow will appear here.</Text>
    </View>
  );
}
