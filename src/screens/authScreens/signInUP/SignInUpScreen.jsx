import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';
import { AuthScreenLayout } from '../../../components/layout';
import { AUTH_SCREEN_HORIZONTAL_PADDING } from '../../../components/layout/authLayoutConstants';
import { AnimatedView, Typography } from '../../../components';
import whiteLogo from '../../../assets/images/whiteLogo.webp';
import darkLogo from '../../../assets/images/darkLogo.webp';
import backButton from '../../../assets/images/backButton.webp';
import { SignInUpTab } from './components/SignInUpTab';
import { resetToMain } from '../../../navigation/navigationRef';
import { useResponsiveLayout, useTheme, useThemedFocusStatusBar, useThemedStyles } from '../../../hooks';

export function SignInUpScreen() {
  const styles = useThemedStyles(createStyles);
  const layout = useResponsiveLayout();
  const { isDarkMode, colors } = useTheme();
  useThemedFocusStatusBar({ inverted: true });

  return (
    <AuthScreenLayout
      withGradient
      isReversed
      gradientIsLight={isDarkMode}
      gradientHeight={'100%'}
      contentStyle={styles.screen}
    >
      <View style={[layout.compact && styles.headerContentSmall,
      styles.headerContent]}>
        <Pressable onPress={resetToMain}>
          <Image
            source={backButton}
            style={[styles.image, layout.compact && styles.imageSmall]}
            resizeMode="cover"
          />
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
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        // keyboardShouldPersistTaps="handled"
        // keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >


        <View
          style={[
            styles.tabsSection,
            layout.compact && styles.tabsSectionSmall,
          ]}
        >
          <SignInUpTab />
        </View>
      </KeyboardAwareScrollView>

    </AuthScreenLayout>
  );
}

const createStyles = () =>
  StyleSheet.create({
    screen: {
      flex: 1,
      width: '100%',
      paddingHorizontal: 0,
      paddingBottom: 0,
    },
    scroll: {
      flex: 1,
      width: '100%',
    },
    scrollContent: {
      flexGrow: 1,
      width: '100%',
    },
    tabsSection: {
      flexGrow: 1,
      width: '100%',
      marginTop: '30%',
    },
    tabsSectionSmall: {
      marginTop: '10%',
    },
    headerContainer: {
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: AUTH_SCREEN_HORIZONTAL_PADDING,
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
      // marginBottom: '20%',
      paddingHorizontal: 15,
      // backgroundColor: 'red',
    },
    headerContentSmall: {
      // marginBottom: '0%',
    },
    image: {
      width: 60,
      height: 60,
      marginLeft: -15,
    },
    imageSmall: {
      width: 60,
      height: 60,
    },
  });
