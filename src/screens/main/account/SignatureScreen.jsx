import { Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function SignatureScreen() {
  const styles = useMainScreenStyles();
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Signature</Text>
      <Text style={styles.subtitle}>Draw or upload your signature here.</Text>
    </View>
  );
}
