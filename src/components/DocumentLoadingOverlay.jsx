import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { AnimatedView } from './animation';
import LottieAnimation from './animation/LottieAnimation';
import LogoIcon from './icons/LogoIcon';
import { Typography } from './typography';
import { useTheme } from '../hooks';
import { FONT_FAMILY } from '../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../utils/dimensions';

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

/**
 * Full-screen loading overlay with native blur.
 * Rendered as an absolute backdrop (not RN Modal) so BlurView does not
 * snapshot a separate window and blank the screen underneath on dismiss.
 */
export function DocumentLoadingOverlay({
  visible,
  quote,
}) {
  const { isDarkMode } = useTheme();
  const blurType = isDarkMode ? 'dark' : 'light';

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.fullScreenOverlay} pointerEvents="auto">
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
      <View style={styles.overlayContent}>
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
      </View>
      <AnimatedView
        animation="fadeIn"
        delay={650}
        duration={600}
        style={styles.lottieContainer}
      >
        <LottieAnimation
          source={require('../assets/lottie/Law.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFill,
    // zIndex: 1000,
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
