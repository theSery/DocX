import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from './animation';
import LottieAnimation from './animation/LottieAnimation';
import LogoIcon from './icons/LogoIcon';
import { Typography } from './typography';
import { useTheme } from '../hooks';
import { FONT_FAMILY } from '../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../utils/dimensions';

/** Keep in sync with DocumentCreateScreen reveal timing. */
export const DOCUMENT_LOADING_OVERLAY_FADE_OUT_MS = 650;

export const DOCUMENT_LOADING_QUOTES = [
  '«Յուրաքանչյուր նոր փաստաթուղթ՝ քո ապագայի քայլ է»',
  '«Ճիշտ փաստաթուղթը բացում է նոր հնարավորություններ»',
  '«Այսօրվա որոշումը վաղվա անվտանգությունն է»',
  '«Յուրաքանչյուր ստորագրություն՝ քո վստահության կնիքն է»',
  '«Կարգ ու կանոնով գրված խոսքը ուժ է ստանում»',
  '«Փոքր քայլը մեծ փոփոխության սկիզբն է»',
  '«Պարզությունն ու ճշտությունը հաջողության հիմքն են»',
  '«Քո իրավունքը սկսվում է ճիշտ ձևակերպված խոսքից»',
  '«Ամեն նոր փաստաթուղթ մոտեցնում է նպատակիդ»',
  '«Հստակ գրված միտքը դառնում է գործողություն»',
];

/** @deprecated Use DOCUMENT_LOADING_QUOTES / getNextDocumentLoadingQuote */
export const DOCUMENT_LOADING_QUOTE = DOCUMENT_LOADING_QUOTES[0];

/** @type {string[]} */
let quoteDeck = [];
/** @type {string | null} */
let lastDocumentLoadingQuote = null;

function shuffleQuotes(quotes) {
  const deck = [...quotes];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  return deck;
}

/**
 * Picks the next loading quote from a shuffled deck so repeats are rare,
 * and never returns the same quote twice in a row.
 */
export function getNextDocumentLoadingQuote() {
  if (quoteDeck.length === 0) {
    quoteDeck = shuffleQuotes(DOCUMENT_LOADING_QUOTES);
    if (
      quoteDeck.length > 1 &&
      quoteDeck[0] === lastDocumentLoadingQuote
    ) {
      quoteDeck.push(quoteDeck.shift());
    }
  }

  let nextQuote = quoteDeck.shift();

  if (nextQuote === lastDocumentLoadingQuote && DOCUMENT_LOADING_QUOTES.length > 1) {
    if (quoteDeck.length === 0) {
      quoteDeck = shuffleQuotes(
        DOCUMENT_LOADING_QUOTES.filter(quote => quote !== lastDocumentLoadingQuote),
      );
    }
    nextQuote = quoteDeck.shift() ?? nextQuote;
  }

  lastDocumentLoadingQuote = nextQuote;
  return nextQuote;
}

const FADE_OUT_EASING = Easing.out(Easing.cubic);
const FADE_IN_EASING = Easing.out(Easing.quad);

const DocumentLoadingOverlayContext = createContext(null);

/**
 * Hosts the loading overlay at the app root so it covers navigation chrome
 * (header, floating tab bar) while staying in the same window as BlurView.
 */
export function DocumentLoadingOverlayProvider({ children }) {
  const [overlayState, setOverlayState] = useState({
    visible: false,
    quote: undefined,
  });

  const sync = useCallback((visible, quote) => {
    setOverlayState({
      visible: Boolean(visible),
      quote,
    });
  }, []);

  const value = useMemo(() => ({ sync }), [sync]);

  return (
    <DocumentLoadingOverlayContext.Provider value={value}>
      <View style={styles.host} pointerEvents="box-none" collapsable={false}>
        {children}
        <DocumentLoadingOverlayView
          visible={overlayState.visible}
          quote={overlayState.quote}
        />
      </View>
    </DocumentLoadingOverlayContext.Provider>
  );
}

/**
 * Full-screen loading overlay with native blur.
 * When wrapped by DocumentLoadingOverlayProvider, the visual layer is rendered
 * at the app root (above header + tab bar). Avoid RN Modal — BlurView in a
 * separate window blanks the screen underneath on dismiss.
 */
export function DocumentLoadingOverlay({
  visible,
  quote,
}) {
  const overlayHost = useContext(DocumentLoadingOverlayContext);

  useEffect(() => {
    if (!overlayHost) {
      return undefined;
    }

    overlayHost.sync(visible, quote);
    return undefined;
  }, [overlayHost, visible, quote]);

  // Clear only on unmount so quote updates do not flash the overlay off.
  useEffect(() => {
    if (!overlayHost) {
      return undefined;
    }

    return () => {
      overlayHost.sync(false, undefined);
    };
  }, [overlayHost]);

  if (overlayHost) {
    return null;
  }

  return <DocumentLoadingOverlayView visible={visible} quote={quote} />;
}

function DocumentLoadingOverlayView({
  visible,
  quote,
}) {
  const { isDarkMode } = useTheme();
  const blurType = isDarkMode ? 'dark' : 'light';
  const [mounted, setMounted] = useState(visible);
  const opacity = useSharedValue(visible ? 1 : 0);
  const contentTranslateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.value = withTiming(1, {
        duration: 420,
        easing: FADE_IN_EASING,
      });
      contentTranslateY.value = withTiming(0, {
        duration: 420,
        easing: FADE_IN_EASING,
      });
      return undefined;
    }

    if (!mounted) {
      return undefined;
    }

    contentTranslateY.value = withTiming(-16, {
      duration: DOCUMENT_LOADING_OVERLAY_FADE_OUT_MS,
      easing: FADE_OUT_EASING,
    });
    opacity.value = withTiming(
      0,
      {
        duration: DOCUMENT_LOADING_OVERLAY_FADE_OUT_MS,
        easing: FADE_OUT_EASING,
      },
      finished => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      },
    );

    return undefined;
  }, [visible, mounted, opacity, contentTranslateY]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.fullScreenOverlay, overlayStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={blurType}
        blurAmount={20}
        reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.72)"
        {...(Platform.OS === 'android' && {
          overlayColor: 'rgba(0, 0, 0, 0.35)',
        })}
      />
      <View style={styles.overlayTint} />
      <Animated.View style={[styles.overlayContent, contentStyle]}>
        <AnimatedView animation="fadeInDown" duration={600} style={styles.logoContainer}>
          <LogoIcon width={72} height={72} />
        </AnimatedView>

        {quote ? (
          <AnimatedView animation="fadeIn" delay={350} duration={600}>
            <Typography variant="h4" tone="onDark" style={styles.quote}>
              {quote}
            </Typography>
          </AnimatedView>
        ) : null}
      </Animated.View>
      <Animated.View style={[styles.lottieContainer, contentStyle]}>
        <AnimatedView
          animation="fadeIn"
          delay={650}
          duration={600}
        >
          <LottieAnimation
            source={require('../assets/lottie/Law.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </AnimatedView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10000,
    elevation: 10000,
    overflow: 'hidden',
  },
  overlayTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
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
    alignItems: 'flex-start',
    marginBottom: TAB_BAR_BOTTOM_OFFSET,
  },
  lottie: {
    width: 160,
    height: 100,
  },
  quote: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 18,
    fontFamily: FONT_FAMILY.black,
  },
});
