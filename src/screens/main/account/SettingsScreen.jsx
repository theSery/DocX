import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { privacyPolicyApi, termsOfUseApi } from '../../../api';
import { ColorSchemeToggle } from '../../../components/theme';
import { PrivacyPolicyModal } from '../../../components/account/PrivacyPolicyModal';
import { useGlobalStyles, useTheme, useThemedFocusStatusBar, useThemedStyles } from '../../../hooks';
import { AnimatedView, Typography } from '../../../components';

import ContactUsSvg from '../../../components/icons/ContactUsSvg';
import PrivacyPolicySvg from '../../../components/icons/PrivacyPolicySvg';
import TermsSvg from '../../../components/icons/TermsSvg';

const WHATSAPP_CONTACT_URL = 'https://wa.me/message/PUQFRZBB53PPK1';

const LEGAL_DOCUMENTS = {
  privacy: {
    title: 'Գաղտնիության քաղաքականություն',
    logKey: 'privacy-policy',
    fetchDocument: () => privacyPolicyApi.getPrivacyPolicy(),
  },
  terms: {
    title: 'Օգտագործման պայմաններ և դրույթներ',
    logKey: 'terms-of-use',
    fetchDocument: () => termsOfUseApi.getTermsOfUse(),
  },
};

export function SettingsScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  useThemedFocusStatusBar({ inverted: true });
  const [activeLegalDocument, setActiveLegalDocument] = useState(null);

  const closeLegalModal = useCallback(() => {
    setActiveLegalDocument(null);
  }, []);

  const openWhatsApp = useCallback(() => {
    Linking.openURL(WHATSAPP_CONTACT_URL);
  }, []);

  const activeDocument = activeLegalDocument
    ? LEGAL_DOCUMENTS[activeLegalDocument]
    : null;

  return (
    <>
      <ScrollView
        style={[globalStyles.screen, styles.screen]}
        contentContainerStyle={[styles.contentContainer]}
      >
        <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
          <View style={styles.balanceContainer}>
            <Typography variant="h4" tone="disabled">
              Ինտերֆեյս
            </Typography>
          </View>

          <View style={styles.section}>
            <View style={[styles.menuList, styles.menuItem]}>
              <ColorSchemeToggle />
            </View>
          </View>

          <View style={styles.sectionSpaced}>
            <Typography variant="h4" tone="disabled">
              Օգնություն
            </Typography>
            <View style={styles.menuList}>
              <Pressable
                style={[styles.menuItem]}
                onPress={openWhatsApp}
              >
                <View style={styles.menuItemRow}>
                  <ContactUsSvg fill={colors.icons} width={20} height={20} />
                  <Typography variant="h5">Կապ մեզ հետ</Typography>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionSpaced}>
            <Typography variant="h4" tone="disabled">
              Իրավական
            </Typography>
            <View style={styles.menuList}>
              <Pressable
                style={[styles.menuItem, { marginBottom: 10 }]}
                onPress={() => setActiveLegalDocument('privacy')}
              >
                <View style={styles.menuItemRow}>
                  <PrivacyPolicySvg fill={colors.icons} width={20} height={20} />
                  <Typography variant="h5">
                    Գաղտնիության քաղաքականություն
                  </Typography>
                </View>
              </Pressable>
              <Pressable
                style={[styles.menuItem]}
                onPress={() => setActiveLegalDocument('terms')}
              >
                <View style={styles.menuItemRow}>
                  <TermsSvg fill={colors.icons} width={20} height={20} />
                  <Typography variant="h5">
                    Օգտագործման պայմաններ և դրույթներ
                  </Typography>
                </View>
              </Pressable>
            </View>
          </View>
        </AnimatedView>

        <Typography variant="h5" tone="secondary" style={styles.footer}>
          © 2026 - DOCX Բոլոր իրավունքները պաշտպանված են
        </Typography>
      </ScrollView>

      <PrivacyPolicyModal
        visible={Boolean(activeDocument)}
        onClose={closeLegalModal}
        title={activeDocument?.title}
        fetchDocument={activeDocument?.fetchDocument}
        logKey={activeDocument?.logKey}
      />
    </>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
    },
    content: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      marginTop: 30,
    },
    balanceContainer: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    balanceRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    section: {
      width: '100%',
    },
    sectionSpaced: {
      width: '100%',
      marginVertical: 30,
    },
    menuList: {
      marginTop: 10,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.textDisabled,
      paddingHorizontal: 20,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      width: '80%',
    },
    footer: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 8,
    },
    contentContainer: {
      justifyContent: 'space-between',
      height: '80%',
    },
  });
