import { Pressable, Text, View } from 'react-native';
import { authScreenStyles as styles } from './authScreenStyles';

export function VerificationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification</Text>
      <Text style={styles.subtitle}>Confirm your identity to continue.</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('PinCode')}>
        <Text style={styles.primaryButtonText}>Verify</Text>
      </Pressable>
    </View>
  );
}
