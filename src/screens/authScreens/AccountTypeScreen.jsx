import { Pressable, Text, View } from 'react-native';
import { useAuthScreenStyles } from '../../hooks';

export function AccountTypeScreen({ navigation }) {
  const styles = useAuthScreenStyles();

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
