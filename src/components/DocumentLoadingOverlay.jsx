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
import { citat } from '../data/citat';
import { useTheme } from '../hooks';
import { colors, FONT_FAMILY, palette } from '../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../utils/dimensions';

/** Keep in sync with DocumentCreateScreen reveal timing. */
export const DOCUMENT_LOADING_OVERLAY_FADE_OUT_MS = 650;

export const DOCUMENT_LOADING_QUOTES = citat;

/** @deprecated Use DOCUMENT_LOADING_QUOTES / getNextDocumentLoadingQuote */
export const DOCUMENT_LOADING_QUOTE = DOCUMENT_LOADING_QUOTES[0];

/** @type {typeof citat} */
let quoteDeck = [];
/** @type {(typeof citat)[number] | null} */
let lastDocumentLoadingQuote = null;

function getQuoteKey(quote) {
  if (quote == null) {
    return null;
  }

  if (typeof quote === 'object') {
    return quote.id ?? quote.text;
  }

  return quote;
}

function getQuoteText(quote) {
  if (quote == null) {
    return undefined;
  }

  return typeof quote === 'string' ? quote : quote.text;
}

function getQuoteAutor(quote) {
  if (quote == null || typeof quote !== 'object') {
    return undefined;
  }

  return quote.autor;
}

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
  const lastQuoteKey = getQuoteKey(lastDocumentLoadingQuote);

  if (quoteDeck.length === 0) {
    quoteDeck = shuffleQuotes(DOCUMENT_LOADING_QUOTES);
    if (
      quoteDeck.length > 1 &&
      getQuoteKey(quoteDeck[0]) === lastQuoteKey
    ) {
      quoteDeck.push(quoteDeck.shift());
    }
  }

  let nextQuote = quoteDeck.shift();

  if (
    getQuoteKey(nextQuote) === lastQuoteKey &&
    DOCUMENT_LOADING_QUOTES.length > 1
  ) {
    if (quoteDeck.length === 0) {
      quoteDeck = shuffleQuotes(
        DOCUMENT_LOADING_QUOTES.filter(
          quote => getQuoteKey(quote) !== lastQuoteKey,
        ),
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
  // const { isDarkMode } = useTheme();
  const blurType =  'light';
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

  const quoteText = getQuoteText(quote);
  const quoteAutor = getQuoteAutor(quote);

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
        reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.52)"
        {...(Platform.OS === 'android' && {
          overlayColor: 'rgba(0, 0, 0, 0.35)',
        })}
      />
      <View style={styles.overlayTint} />
      <Animated.View style={[styles.overlayContent, contentStyle]}>
        <AnimatedView animation="fadeInDown" duration={600} style={styles.logoContainer}>
          <LogoIcon width={72} height={72} fill={palette.white}/>
        </AnimatedView>

        {quoteText ? (
          <AnimatedView animation="fadeIn" delay={350} duration={600} style={styles.quoteContainer}>
            <Typography variant="h4" style={[styles.quote, { color: palette.white }]}>
              {quoteText}
            </Typography>
            {quoteAutor ? (
              <Typography
                variant="h5"
                tone="onDark"
                style={[styles.quoteAutor, { color: palette.white }]}
              >
                {quoteAutor}
              </Typography>
            ) : null}
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
    width: 190,
    height: 130,
  },
  quote: {
    textAlign: 'center',

    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
  },
  quoteAutor: {
    marginTop: 16,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
  quoteContainer: {
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',

  },
});
