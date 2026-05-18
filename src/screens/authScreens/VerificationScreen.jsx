import { Pressable, Text, View } from 'react-native';
import { useAuthScreenStyles } from '../../hooks';

export function VerificationScreen({ navigation }) {
  const styles = useAuthScreenStyles();

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
