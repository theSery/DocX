import { Pressable, Text, View } from 'react-native';
import { useAuth } from '../../contexts';
import { authScreenStyles as styles } from './authScreenStyles';

export function OnboardingScreen({ navigation }) {
  const { completeOnboarding } = useAuth();

  const handleContinue = async () => {
    await completeOnboarding();
    navigation.navigate('AccountType');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to DocX</Text>
      <Text style={styles.subtitle}>
        Organize your documents in one place.
      </Text>
      <Pressable style={styles.primaryButton} onPress={handleContinue}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </Pressable>
    </View>
  );
}
