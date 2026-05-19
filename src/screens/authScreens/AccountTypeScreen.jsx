import { Pressable, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../components/layout';
import { useAuthScreenStyles } from '../../hooks';

export function AccountTypeScreen({ navigation }) {
  const styles = useAuthScreenStyles();

  return (
    <AuthScreenLayout style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Account type</Text>
        <Text style={styles.subtitle}>Choose how you will use DocX.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SignInUp')}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}
