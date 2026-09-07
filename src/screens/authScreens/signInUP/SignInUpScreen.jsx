import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';
import { AuthScreenLayout, KeyboardAvoidingView } from '../../../components/layout';
import { AnimatedView, Typography } from '../../../components';
import whiteLogo from '../../../assets/images/whiteLogo.webp';
import darkLogo from '../../../assets/images/darkLogo.webp';
import backButton from '../../../assets/images/backButton.webp';
import { SignInUpTab } from './components/SignInUpTab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resetToMain } from '../../../navigation/navigationRef';
import { useResponsiveLayout, useTheme, useThemedFocusStatusBar, useThemedStyles } from '../../../hooks';

export function SignInUpScreen() {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const layout = useResponsiveLayout();
  const { isDarkMode, colors } = useTheme();
  const isKeyboardVisible = useKeyboardState(state => state.isVisible);
  useThemedFocusStatusBar({ inverted: true });

  return (
    <AuthScreenLayout
      withGradient
      isReversed
      gradientIsLight={isDarkMode}
      gradientHeight={'100%'}
      contentStyle={styles.screen}
    >
      <KeyboardAvoidingView style={styles.keyboardView}>
        <View style={styles.headerContainer}>
          <View
            style={[
              styles.headerContent,
              layout.compact && styles.headerContentSmall,
              isKeyboardVisible && !layout.compact && styles.headerContentCompact,
            ]}
          >
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
            <Image
              source={isDarkMode ? darkLogo : whiteLogo}
              style={layout.compact ? layout.logo : styles.logo}
              resizeMode={layout.compact ? 'contain' : undefined}
            />
          </AnimatedView>
        </View>
        <View
          style={[
            styles.tabsSection,
            { marginBottom: -insets.bottom },
            layout.compact && styles.tabsSectionSmall,
            isKeyboardVisible && !layout.compact && styles.tabsSectionCompact,
          ]}
        >
          <SignInUpTab />
        </View>
      </KeyboardAvoidingView>
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
    keyboardView: {
      flex: 1,
      width: '100%',
    },
    tabsSection: {
      flex: 1,
      width: '100%',
      marginTop: '20%',
    },
    tabsSectionSmall: {
      marginTop: '10%',
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
      marginBottom: '20%',
    },
    headerContentSmall: {
      marginBottom: '0%',
    },
    headerContentCompact: {
      marginBottom: 8,
    },
    tabsSectionCompact: {
      marginTop: 8,
    },
    image: {
      width: 70,
      height: 70,
      marginLeft: -15,
    },
  });
