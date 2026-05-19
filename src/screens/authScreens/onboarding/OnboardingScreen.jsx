import { StyleSheet } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { MainContainer } from './components/MainContainer';

export function OnboardingScreen({ navigation }) {
  return (
    <AuthScreenLayout withGradient contentStyle={styles.layoutContent}>
      <MainContainer navigation={navigation} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  layoutContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
