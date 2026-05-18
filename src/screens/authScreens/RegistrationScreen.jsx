import { Pressable, Text, View } from 'react-native';
import { useAuthScreenStyles } from '../../hooks';

export function RegistrationScreen({ navigation }) {
  const styles = useAuthScreenStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration</Text>
      <Text style={styles.subtitle}>Create your DocX account.</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Verification')}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </Pressable>
    </View>
  );
}
