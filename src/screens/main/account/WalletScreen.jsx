import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AnimatedView, Typography } from '../../../components';
import DocumentsSvg from '../../../components/icons/DocumentsSvg';
import LogoIcon from '../../../components/icons/LogoIcon';
import PlusSvg from '../../../components/icons/PlusSvg';
import WalletSvg from '../../../components/icons/WalletSvg';
import { useGlobalStyles, useThemedStyles } from '../../../hooks';
import { useAppSelector } from '../../../store';
import { selectPersonalData } from '../../../store/slices/personalDataSlice';
import { FONT_FAMILY, palette } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';

const WALLET_TEAL = '#00A88E';

const TRANSACTIONS = [
  {
    id: 1,
    type: 'document',
    title: 'Փաստաթղթի գեներացում',
    date: 'Այսօր, 13:33',
    amount: -5,
  },
  {
    id: 2,
    type: 'topup',
    title: 'Դրամապանակի համալրում',
    date: 'Երեկ, 16:40',
    amount: 20,
  },
  {
    id: 3,
    type: 'document',
    title: 'Փաստաթղթի գեներացում',
    date: '20 Ապրիլ, 13:33',
    amount: -5,
  },
  {
    id: 4,
    type: 'document',
    title: 'Փաստաթղթի գեներացում',
    date: '14 Մարտ, 13:33',
    amount: -5,
  },
  {
    id: 5,
    type: 'topup',
    title: 'Դրամապանակի համալրում',
    date: '14 Մարտ, 16:40',
    amount: 5,
  },
];

function BalanceAmount({ amount }) {
  return (
    <View style={staticStyles.balanceAmountRow}>
      <Typography variant="h1" tone="onDark" style={staticStyles.balanceNumber}>
        {amount}
      </Typography>
      <LogoIcon width={38} height={38} />
    </View>
  );
}

function TransactionAmount({ amount }) {
  const isPositive = amount > 0;
  const amountColor = isPositive ? palette.green : palette.red;
  const displayValue = isPositive ? `+${amount}` : String(amount);

  return (
    <View style={staticStyles.transactionAmount}>
      <Typography style={[staticStyles.transactionAmountValue, { color: amountColor }]}>
        {displayValue}
      </Typography>
      <Typography variant="h6" tone="disabled" style={staticStyles.transactionCurrency}>
        DX
      </Typography>
    </View>
  );
}

function TransactionItem({ transaction }) {
  const globalStyles = useGlobalStyles();
  const isTopUp = transaction.type === 'topup';
  const iconBg = isTopUp ? '#D4F5EE' : '#E8EFFF';
  const iconColor = isTopUp ? palette.green : palette.mainBlue;

  return (
    <View style={[globalStyles.cardShadow, staticStyles.transactionCard]}>
      <View style={[staticStyles.transactionIcon, { backgroundColor: iconBg }]}>
        {isTopUp ? (
          <WalletSvg fill={iconColor} width={22} height={22} />
        ) : (
          <DocumentsSvg fill={iconColor} width={22} height={22} />
        )}
      </View>
      <View style={staticStyles.transactionInfo}>
        <Typography variant="h5" style={staticStyles.transactionTitle}>
          {transaction.title}
        </Typography>
        <Typography variant="h6" tone="disabled">
          {transaction.date}
        </Typography>
      </View>
      <TransactionAmount amount={transaction.amount} />
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
    },
    content: {
      paddingTop: 20,
      paddingBottom: 16,
    },
    balanceCard: {
      backgroundColor: WALLET_TEAL,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 116,
    },
    balanceInfo: {
      flex: 1,
      paddingRight: 12,
      gap: 6,
    },
    balanceName: {
      fontFamily: FONT_FAMILY.bold,
      letterSpacing: 0.3,
    },
    balanceLabel: {
      fontFamily: FONT_FAMILY.regular,
      opacity: 0.9,
    },
    sectionTitle: {
      color: palette.mainBlue,
      letterSpacing: 0.3,
      marginTop: 28,
      marginBottom: 16,
    },
    transactionList: {
      gap: 10,
    },
    footer: {
      paddingTop: 12,
      backgroundColor: palette.backgroundWhite,
    },
    topUpButton: {
      backgroundColor: WALLET_TEAL,
      borderRadius: 16,
      height: 50,
      justifyContent: 'center',
    },
    topUpInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    topUpPlus: {
      position: 'absolute',
      left: 20,
    },
    topUpText: {
      color: palette.white,
      fontFamily: FONT_FAMILY.regular,
      fontSize: 14,
      letterSpacing: 0.8,
    },
  });

const staticStyles = StyleSheet.create({
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceNumber: {
    fontSize: 44,
    lineHeight: 48,
    fontFamily: FONT_FAMILY.bold,
    letterSpacing: 0.5,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.pureWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    gap: 4,
  },
  transactionTitle: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.black,
  },
  transactionAmount: {
    alignItems: 'flex-end',
    minWidth: 44,
  },
  transactionAmountValue: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FONT_FAMILY.bold,
  },
  transactionCurrency: {
    marginTop: 2,
    fontSize: 11,
  },
});

export function WalletScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const personalData = useAppSelector(selectPersonalData);
  const fullName =
    [personalData?.name, personalData?.surname].filter(Boolean).join(' ') ||
    'Վարդուհի Հարությունյան';

  const handleTopUp = () => {
    console.log('top up wallet');
  };

  return (
    <View style={[globalStyles.screen, styles.screen]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AnimatedView animation="fadeIn" duration={500}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceInfo}>
              <Typography variant="h4" tone="onDark" style={styles.balanceName}>
                {fullName}
              </Typography>
              <Typography variant="h6" tone="onDark" style={styles.balanceLabel}>
                Ընթացիկ հաշիվը
              </Typography>
            </View>
            <BalanceAmount amount={5} />
          </View>

          <Typography variant="h4" style={styles.sectionTitle}>
            Գործարքներ
          </Typography>

          <View style={styles.transactionList}>
            {TRANSACTIONS.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </View>
        </AnimatedView>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: TAB_BAR_BOTTOM_OFFSET }]}>
        <Pressable onPress={handleTopUp} style={styles.topUpButton}>
          <View style={styles.topUpInner}>
            <View style={styles.topUpPlus}>
              <PlusSvg fill={palette.white} width={20} height={20} />
            </View>
            <Typography variant="h5" style={styles.topUpText}>
              Համալրել
            </Typography>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
