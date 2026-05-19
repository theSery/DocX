import { Pressable, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../components/layout';
import { useAuth } from '../../contexts';
import { useAuthScreenStyles } from '../../hooks';

export function PinCodeScreen() {
  const styles = useAuthScreenStyles();
  const { setIsSign } = useAuth();

  const handleComplete = async () => {
    await setIsSign(true);
  };

  return (
    <AuthScreenLayout style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>PIN code</Text>
        <Text style={styles.subtitle}>Set a PIN to secure your account.</Text>
        <Pressable style={styles.primaryButton} onPress={handleComplete}>
          <Text style={styles.primaryButtonText}>Finish</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}
