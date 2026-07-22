import { Modal, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { AnimatedView } from './animation';
import LottieAnimation from './animation/LottieAnimation';
import LogoIcon from './icons/LogoIcon';
import { Typography } from './typography';
import { FONT_FAMILY } from '../theme';

export const DOCUMENT_LOADING_QUOTE =
  '«Յուրաքանչյուր նոր փաստաթուղթ՝ քո ապագայի քայլ է»';

export function DocumentLoadingOverlay({
  visible,
  quote = DOCUMENT_LOADING_QUOTE,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.fullScreenOverlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={1}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.5)"
          {...(Platform.OS === 'android' && {
            overlayColor: 'rgba(0, 0, 0, 0.25)',
          })}
        />
        <View style={styles.overlayTint} />
        <View style={styles.overlayContent}>
          <AnimatedView animation="fadeInDown" duration={600} style={styles.logoContainer}>
            <LogoIcon width={72} height={72} />
          </AnimatedView>

          <AnimatedView animation="fadeIn" delay={350} duration={600}>
            <Typography variant="h4" tone="onDark" style={styles.quote}>
              {quote}
            </Typography>
          </AnimatedView>
        </View>
        <AnimatedView
          animation="fadeIn"
          delay={650}
          duration={600}
          style={[styles.lottieContainer, { marginBottom: 50, marginTop: 0 }]}
        >
          <LottieAnimation
            source={require('../assets/lottie/Law.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </AnimatedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  overlayTint: {
    ...StyleSheet.absoluteFill,
  },
  overlayContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  lottieContainer: {
    marginTop: 28,
  },
  lottie: {
    width: 160,
    height: 100,
  },
  quote: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 22,
    fontFamily: FONT_FAMILY.black,
  },
});
