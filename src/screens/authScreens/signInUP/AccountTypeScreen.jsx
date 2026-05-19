import { Image, Pressable, StatusBar, StyleSheet, View } from 'react-native';
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

      <StatusBar barStyle="light-content" />
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
        <Pressable
         onPress={() => navigation.navigate('SignInUp')}
         style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View>
            <Typography variant="h4">Ֆիզիկական անձ</Typography>
          </View>
          <Typography variant="h6" tone="secondary">Անհատներ, ՀՀ քաղաքացիներ</Typography>
          <View>
            <Typography variant="h5">Ընտրել</Typography>
          </View>
        </Pressable>
        <View style={styles.buttonsContainer}></View>
        <Pressable style={styles.button}>
          <View>
            <Typography variant="h4">Ֆիզիկական անձ</Typography>
          </View>
          <Typography variant="h6" tone="secondary">Անհատներ, ՀՀ քաղաքացիներ</Typography>
          <View>
            <Typography variant="h5">Ընտրել</Typography>
          </View>
        </Pressable>
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
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
    // backgroundColor: colors.background,
  },
});