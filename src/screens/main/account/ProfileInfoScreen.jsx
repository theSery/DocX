import { Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function ProfileInfoScreen() {
  const styles = useMainScreenStyles();
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Profile info</Text>
      <Text style={styles.subtitle}>Your profile details will appear here.</Text>
    </View>
  );
}
