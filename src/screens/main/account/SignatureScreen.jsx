import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function SignatureScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Signature</Text>
      <Text style={styles.subtitle}>Draw or upload your signature here.</Text>
    </View>
  );
}
