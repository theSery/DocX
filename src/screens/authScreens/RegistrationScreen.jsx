import { Pressable, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../components/layout';
import { useAuthScreenStyles } from '../../hooks';

export function RegistrationScreen({ navigation }) {
  const styles = useAuthScreenStyles();

  return (
    <AuthScreenLayout style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Registration</Text>
        <Text style={styles.subtitle}>Create your DocX account.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Verification')}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}
