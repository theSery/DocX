import { Image, StatusBar, StyleSheet, View } from 'react-native';
import { AnimatedView, Typography } from '../../../components';
import { AuthScreenLayout } from '../../../components/layout';
import { useTheme } from '../../../hooks/useTheme';
import whiteLogo from '../../../assets/images/whiteLogo.webp';

export function AccountTypeScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <AuthScreenLayout
      withGradient
      isReversed
      gradientIsLight={false}
      gradientHeight={'32%'}
      contentStyle={styles.screen}>

      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <AnimatedView animation="fadeInUp" duration={500} style={styles.logoContainer}>
          <Image source={whiteLogo} style={styles.logo} />
        </AnimatedView>
      </View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Typography variant="h2" style={styles.title}>Ընտրեք հաշվի տեսակը`</Typography>
        <Typography variant="h5" tone="secondary" style={styles.subtitle}>
          Շարունակելու և փաստաթղթերի ստեղծման համար ընտրեք Ձեզ համապատասխանող իրավաբանական
          կարգավիճակը
        </Typography>
      </View>

    </AuthScreenLayout>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginTop: '30%',
    height: 62,
    width: 250,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 24,
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 32,
  },
});