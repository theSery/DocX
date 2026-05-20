import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuth } from '../../../contexts';
import { AnimatedView, Typography } from '../../../components';
import whiteLogo from '../../../assets/images/whiteLogo.webp';
import { palette } from '../../../theme';
import backButton from '../../../assets/images/backButton.webp';
import { SignInUpTab } from './components/SignInUpTab';
import { Easing } from 'react-native-reanimated';

export function SignInUpScreen({ navigation }) {
  // const styles = useAuthScreenStyles();
  // signUpBg
  const { setIsSign } = useAuth();

  const handleSignIn = async () => {
    await setIsSign(true);
  };

  return (
    <AuthScreenLayout
    withGradient
    isReversed
    gradientIsLight={false}
    gradientHeight={'100%'}
    contentStyle={styles.screen}
  >
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => navigation.goBack()}>
          <Image source={backButton} style={styles.image}  resizeMode="cover"/>
          </Pressable>
          <Pressable onPress={() => navigation.goBack()}>
          <Typography variant="h5" style={styles.headerCloseButton}>Փակել</Typography>
          </Pressable>
        
        </View>
        <AnimatedView
          animation="fadeIn"
          duration={500}
          style={styles.logoContainer}
        >
          <Image source={whiteLogo} style={styles.logo} />
        </AnimatedView>
      </View>
            <View
        // animation='slideInDown'
        // duration={700}
        // // delay={100}
        // easing={Easing.inOut(Easing.ease)}
        style={styles.tabsSection}
      >
        <SignInUpTab />
      </View>
    </AuthScreenLayout>





    // <AuthScreenLayout style={styles.screen}>
    //   <View style={styles.content}>
    //     <Text style={styles.title}>Sign in or sign up</Text>
    //     <Text style={styles.subtitle}>
    //       Sign in to continue or create a new account.
    //     </Text>
    //     <Pressable style={styles.primaryButton} onPress={handleSignIn}>
    //       <Text style={styles.primaryButtonText}>Sign in</Text>
    //     </Pressable>
    //     <Pressable
    //       style={styles.secondaryButton}
    //       onPress={() => navigation.navigate('Registration')}>
    //       <Text style={styles.secondaryButtonText}>Create account</Text>
    //     </Pressable>
    //   </View>
    // </AuthScreenLayout>
  );
}
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    width: '100%',
  },
  tabsSection: {
    flex: 1,
 marginBottom: -80,
    width: '100%',
    marginTop: '20%',
  },
  headerContainer: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerContent: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom:'10%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerCloseButton: {
    color: palette.white,
  },
  image: {
    width: 70,
    height: 70,
    marginLeft: -15,
  },
});
