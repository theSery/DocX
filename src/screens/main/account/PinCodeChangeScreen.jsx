import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function PinCodeChangeScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Change PIN</Text>
      <Text style={styles.subtitle}>PIN change flow will appear here.</Text>
    </View>
  );
}
