import { StyleSheet, View } from 'react-native';
import { Typography } from '../../../../components';
import LogoIcon from '../../../../components/icons/LogoIcon';
import { FONT_FAMILY } from '../../../../theme';

const WALLET_TEAL = '#00A88E';

function BalanceAmount({ amount }) {
  return (
    <View style={styles.balanceAmountRow}>
      <Typography variant="h1" tone="onDark" style={styles.balanceNumber}>
        {amount}
      </Typography>
      <LogoIcon width={38} height={38} />
    </View>
  );
}

export function WalletBalanceCard({ fullName, amount }) {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceInfo}>
        <Typography variant="h4" tone="onDark" style={styles.balanceName}>
          {fullName}
        </Typography>
        <Typography variant="h6" tone="onDark" style={styles.balanceLabel}>
          Ընթացիկ հաշիվը
        </Typography>
      </View>
      <BalanceAmount amount={amount} />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
