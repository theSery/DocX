import { Pressable, Text, View } from 'react-native';
import { authScreenStyles as styles } from './authScreenStyles';

export function AccountTypeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account type</Text>
      <Text style={styles.subtitle}>Choose how you will use DocX.</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('SignInUp')}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </Pressable>
    </View>
  );
}
