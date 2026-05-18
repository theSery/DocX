import { Text, View } from 'react-native';
import { mainScreenStyles as styles } from '../mainScreenStyles';

export function ProfileInfoScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Profile info</Text>
      <Text style={styles.subtitle}>Your profile details will appear here.</Text>
    </View>
  );
}
