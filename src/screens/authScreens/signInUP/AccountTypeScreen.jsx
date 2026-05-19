import { Image, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { AnimatedView, Typography } from '../../../components';
import { AuthScreenLayout } from '../../../components/layout';
import whiteLogo from '../../../assets/images/whiteLogo.webp';
import { palette } from '../../../theme';
import UserSvg from '../../../components/icons/UserSvg';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import BriefcaseSvg from '../../../components/icons/BriefcaseSvg';
export function AccountTypeScreen({ navigation }) {
  return (
    <AuthScreenLayout
      withGradient
      isReversed
      gradientIsLight={false}
      gradientHeight={'32%'}
      contentStyle={styles.screen}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <AnimatedView
          animation="fadeInUp"
          duration={500}
          style={styles.logoContainer}
        >
          <Image source={whiteLogo} style={styles.logo} />
        </AnimatedView>
      </View>
      <View style={[styles.content]}>
        <Typography variant="h2" style={styles.title}>
          Ընտրեք հաշվի տեսակը`
        </Typography>
        <Typography variant="h5" tone="secondary" style={styles.subtitle}>
          Շարունակելու և փաստաթղթերի ստեղծման համար ընտրեք Ձեզ համապատասխանող
          իրավաբանական կարգավիճակը
        </Typography>
        <Pressable
          onPress={() => navigation.navigate('SignInUp')}
          style={[styles.button]}
        >
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <UserSvg width={24} height={24} fill={palette.black} />
            </View>
            <Typography variant="h4">Ֆիզիկական անձ</Typography>
          </View>
          <Typography variant="h6" tone="secondary">
            Անհատներ, ՀՀ քաղաքացիներ
          </Typography>
          <View style={styles.buttonContent}>
            <Typography variant="h5" style={styles.buttonText}>Ընտրել</Typography>
            <ArrowSvg width={13} height={13} fill={palette.black} />
          </View>
        </Pressable>
        <View style={styles.buttonsContainer}></View>
        <Pressable
          onPress={() => navigation.navigate('SignInUp')}
          style={[styles.button]}
        >
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <BriefcaseSvg width={24} height={24} fill={palette.black} />
            </View>
            <Typography variant="h4">Իրավաբանական անձ</Typography>
          </View>
          <Typography variant="h6" tone="secondary">
            Իրավաբանական անձի կողմից կազմված անվանական հաշիվ
          </Typography>
          <View style={styles.buttonContent}>
            <Typography variant="h5" style={styles.buttonText}>Ընտրել</Typography>
            <ArrowSvg width={13} height={13} fill={palette.black} />
          </View>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: '10%',
  },
  container: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 62,
    width: 250,
  },
  content: {
    // flex: 0.5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
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
    borderWidth: 1,
    borderColor: palette.lightGray,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    width: '100%',
    gap: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.skyBlue,
  },
  buttonText: {
    fontFamily: palette.blueMainStart,
    letterSpacing: 2,
  },
});
