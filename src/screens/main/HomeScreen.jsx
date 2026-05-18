import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
