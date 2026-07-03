import { StyleSheet, View } from 'react-native';
import { Typography } from '../../../../components';
import DocumentsSvg from '../../../../components/icons/DocumentsSvg';
import WalletSvg from '../../../../components/icons/WalletSvg';
import { useGlobalStyles } from '../../../../hooks';
import { FONT_FAMILY, palette } from '../../../../theme';

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

function TransactionAmount({ amount }) {
  const isPositive = amount > 0;
  const amountColor = isPositive ? palette.green : palette.red;
  const displayValue = isPositive ? `+${amount}` : String(amount);

  return (
    <View style={styles.transactionAmount}>
      <Typography style={[styles.transactionAmountValue, { color: amountColor }]}>
        {displayValue}
      </Typography>
      <Typography variant="h6" tone="disabled" style={styles.transactionCurrency}>
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
    <View style={[globalStyles.cardShadow, styles.transactionCard]}>
      <View style={[styles.transactionIcon, { backgroundColor: iconBg }]}>
        {isTopUp ? (
          <WalletSvg fill={iconColor} width={22} height={22} />
        ) : (
          <DocumentsSvg fill={iconColor} width={22} height={22} />
        )}
      </View>
      <View style={styles.transactionInfo}>
        <Typography variant="h5" style={styles.transactionTitle}>
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

export function WalletTransactions() {
  return (
    <>
      <Typography variant="h4" style={styles.sectionTitle}>
        Գործարքներ
      </Typography>

      <View style={styles.transactionList}>
        {TRANSACTIONS.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: palette.mainBlue,
    letterSpacing: 0.3,
    marginTop: 28,
    marginBottom: 16,
  },
  transactionList: {
    gap: 10,
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
