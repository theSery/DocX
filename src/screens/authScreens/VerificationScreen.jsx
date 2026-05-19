import { Pressable, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../components/layout';
import { useAuthScreenStyles } from '../../hooks';

export function VerificationScreen({ navigation }) {
  const styles = useAuthScreenStyles();

  return (
    <AuthScreenLayout style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>Confirm your identity to continue.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('PinCode')}>
          <Text style={styles.primaryButtonText}>Verify</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}
