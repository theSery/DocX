import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AnimatedView, Typography } from '../../../components';
import InfoSvg from '../../../components/icons/InfoSvg';
import PlusSvg from '../../../components/icons/PlusSvg';
import { useGlobalStyles, useThemedStyles } from '../../../hooks';
import { useAppSelector } from '../../../store';
import { selectPersonalData } from '../../../store/slices/personalDataSlice';
import { FONT_FAMILY, palette } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import { WalletBalanceCard } from './components/WalletBalanceCard';
import { TOP_UP_PACKAGES, WalletTopUp } from './components/WalletTopUp';
import { WalletTransactions } from './components/WalletTransactions';

const WALLET_TEAL = '#00A88E';

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
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    priceLabel: {
      color: palette.mainBlue,
      fontFamily: FONT_FAMILY.regular,
    },
    priceValue: {
      color: palette.mainBlue,
      fontFamily: FONT_FAMILY.bold,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 14,
    },
    infoText: {
      flex: 1,
      fontSize: 11,
      lineHeight: 15,
      color: palette.lightGray,
      fontFamily: FONT_FAMILY.regular,
    },
  });

export function WalletScreen() {
  const navigation = useNavigation();
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const personalData = useAppSelector(selectPersonalData);
  const fullName =
    [personalData?.name, personalData?.surname].filter(Boolean).join(' ') ||
    '';

  const [isTopUpMode, setIsTopUpMode] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('plus');

  const selectedPackage =
    TOP_UP_PACKAGES.find((pkg) => pkg.id === selectedPackageId) ??
    TOP_UP_PACKAGES[2];

  useEffect(() => {
    navigation.setOptions({
      title: isTopUpMode ? 'Համալրել դրամապանակը' : 'Դրամապանակ',
    });
  }, [isTopUpMode, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isTopUpMode) {
        return;
      }

      e.preventDefault();
      setIsTopUpMode(false);
    });

    return unsubscribe;
  }, [navigation, isTopUpMode]);

  const handleTopUp = () => {
    if (isTopUpMode) {
      console.log('confirm top up', selectedPackage);
      return;
    }

    setIsTopUpMode(true);
  };

  return (
    <View style={[globalStyles.screen, styles.screen]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AnimatedView animation="fadeIn" duration={500}>
          <WalletBalanceCard fullName={fullName} amount={5} />

          {isTopUpMode ? (
            <WalletTopUp
              selectedId={selectedPackageId}
              onSelect={setSelectedPackageId}
            />
          ) : (
            <WalletTransactions />
          )}
        </AnimatedView>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: TAB_BAR_BOTTOM_OFFSET }]}>
        {isTopUpMode && (
          <>
            <View style={styles.priceRow}>
              <Typography variant="h5" style={styles.priceLabel}>
                Արժեքը՝
              </Typography>
              <Typography variant="h5" style={styles.priceValue}>
                {selectedPackage.price}դր.
              </Typography>
            </View>

            <View style={styles.infoRow}>
              <InfoSvg width={16} height={16} fill={palette.lightGray} />
              <Typography style={styles.infoText}>
                Յուրաքանչյուր DX միավորը համարժեք է 100 ՀՀ դրամի
              </Typography>
            </View>
          </>
        )}

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
