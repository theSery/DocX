import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { AnimatedView, Typography } from '../../../components';
import whiteLogo from '../../../assets/images/whiteLogo.webp';
import darkLogo from '../../../assets/images/darkLogo.webp';
import backButton from '../../../assets/images/backButton.webp';
import { SignInUpTab } from './components/SignInUpTab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resetToMain } from '../../../navigation/navigationRef';
import { useTheme, useThemedStyles } from '../../../hooks';

export function SignInUpScreen() {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const { isDarkMode, colors } = useTheme();

  return (
    <AuthScreenLayout
      withGradient
      isReversed
      gradientIsLight={isDarkMode}
      gradientHeight={'100%'}
      contentStyle={styles.screen}
    >
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Pressable onPress={resetToMain}>
            <Image source={backButton} style={styles.image} resizeMode="cover" />
          </Pressable>
          <Pressable onPress={resetToMain}>
            <Typography
              variant="h5"
              style={{
                color: isDarkMode
                  ? colors.mainBlue
                  : colors.buttonTextOnPrimary,
              }}
            >
              Փակել
            </Typography>
          </Pressable>
        </View>
        <AnimatedView
          animation="fadeIn"
          duration={500}
          style={styles.logoContainer}
        >
          <Image source={isDarkMode ? darkLogo : whiteLogo} style={styles.logo} />
        </AnimatedView>
      </View>
      <View style={[styles.tabsSection, { marginBottom: -insets.bottom }]}>
        <SignInUpTab />
      </View>
    </AuthScreenLayout>
  );
}

const createStyles = () =>
  StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      width: '100%',
    },
    tabsSection: {
      flex: 1,
      width: '100%',
      marginTop: '20%',
    },
    headerContainer: {
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
      marginBottom: '10%',
    },
    image: {
      width: 70,
      height: 70,
      marginLeft: -15,
    },
  });
