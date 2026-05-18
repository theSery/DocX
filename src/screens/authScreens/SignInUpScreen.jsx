import { Pressable, Text, View } from 'react-native';
import { useAuth } from '../../contexts';
import { useAuthScreenStyles } from '../../hooks';

export function SignInUpScreen({ navigation }) {
  const styles = useAuthScreenStyles();
  const { setIsSign } = useAuth();

  const handleSignIn = async () => {
    await setIsSign(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in or sign up</Text>
      <Text style={styles.subtitle}>
        Sign in to continue or create a new account.
      </Text>
      <Pressable style={styles.primaryButton} onPress={handleSignIn}>
        <Text style={styles.primaryButtonText}>Sign in</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Registration')}>
        <Text style={styles.secondaryButtonText}>Create account</Text>
      </Pressable>
    </View>
  );
}
