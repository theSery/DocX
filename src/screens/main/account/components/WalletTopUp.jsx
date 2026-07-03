import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Typography } from '../../../../components';
import GradientBackground from '../../../../components/GradientBackground';
import LogoIcon from '../../../../components/icons/LogoIcon';
import { FONT_FAMILY, palette } from '../../../../theme';

export const TOP_UP_PACKAGES = [
  { id: 'economy', amount: 5, label: 'Էկոնոմ', price: 600 },
  { id: 'standard', amount: 10, label: 'Ստանդարտ', price: 1000 },
  {
    id: 'plus',
    amount: 20,
    label: 'Պլյուս',
    price: 2000,
    bonus: 5,
    isBestOffer: true,
  },
];

function BestOfferBadge() {
  const [badgeHeight, setBadgeHeight] = useState(0);

  return (
    <View
      onLayout={(e) => setBadgeHeight(e.nativeEvent.layout.height)}
      style={[
        styles.bestOfferBadge,
        badgeHeight > 0 && { top: -badgeHeight / 2 },
      ]}
    >
      <Typography variant="h6" tone="onDark" style={styles.bestOfferText}>
        Լավագույն առաջարկ
      </Typography>
    </View>
  );
}

function TopUpPackageCard({ package: pkg, isSelected, onSelect }) {
  const [cardHeight, setCardHeight] = useState(0);

  return (
    <Pressable
      onPress={() => onSelect(pkg.id)}
      onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
      style={[
        styles.packageCard,
        isSelected ? styles.packageCardSelected : styles.packageCardDefault,
      ]}
    >
      {isSelected && cardHeight > 0 && (
        <View style={[styles.gradientLayer, { height: cardHeight - 5 }]}>
          <GradientBackground isLight centered={false} gradientHeight={cardHeight} />
        </View>
      )}

      {isSelected && pkg.isBestOffer && <BestOfferBadge />}

      <View style={styles.packageContent}>
        <View style={styles.packageAmountRow}>
          <Typography variant="h1" style={styles.packageAmount}>
            {pkg.amount}
          </Typography>
          <LogoIcon width={32} height={32} fill={palette.mainBlue} />
        </View>

        <Typography variant="h4" style={styles.packageLabel}>
          {pkg.label}
        </Typography>

        <Typography variant="h6" tone="disabled" style={styles.packagePrice}>
          {pkg.price} դրամ
        </Typography>

        {pkg.bonus != null && (
          <View style={styles.bonusBadge}>
            <Typography variant="h6" tone="onDark" style={styles.bonusText}>
              +{pkg.bonus} DX բոնուս
            </Typography>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export function WalletTopUp({ selectedId, onSelect }) {
  return (
    <View style={styles.packageList}>
      {TOP_UP_PACKAGES.map((pkg) => (
        <TopUpPackageCard
          key={pkg.id}
          package={pkg}
          isSelected={selectedId === pkg.id}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  packageList: {
    marginTop: 20,
    gap: 14,
  },
  packageCard: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  packageCardDefault: {
    backgroundColor: palette.pureWhite,
    borderWidth: 1,
    borderColor: palette.borderLight,
  },
  packageCardSelected: {
    borderWidth: 2,
    borderColor: palette.mainBlue,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18,
    overflow: 'hidden',
  },
  packageContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  bestOfferBadge: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 2,
    backgroundColor: palette.green,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bestOfferText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  packageAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  packageAmount: {
    color: palette.mainBlue,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 40,
    lineHeight: 44,
  },
  packageLabel: {
    color: palette.mainBlue,
    fontFamily: FONT_FAMILY.bold,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  packagePrice: {
    fontFamily: FONT_FAMILY.regular,
  },
  bonusBadge: {
    marginTop: 12,
    backgroundColor: palette.mainBlue,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  bonusText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
