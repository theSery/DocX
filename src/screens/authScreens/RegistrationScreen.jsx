import { Pressable, Text, View } from 'react-native';
import { authScreenStyles as styles } from './authScreenStyles';

export function RegistrationScreen({ navigation }) {
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
