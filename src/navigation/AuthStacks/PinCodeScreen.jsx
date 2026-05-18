import { Pressable, Text, View } from 'react-native';
import { useAuth } from './AuthContext';
import { authScreenStyles as styles } from './authScreenStyles';

export function PinCodeScreen() {
  const { setIsSign } = useAuth();

  const handleComplete = async () => {
    await setIsSign(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PIN code</Text>
      <Text style={styles.subtitle}>Set a PIN to secure your account.</Text>
      <Pressable style={styles.primaryButton} onPress={handleComplete}>
        <Text style={styles.primaryButtonText}>Finish</Text>
      </Pressable>
    </View>
  );
}
