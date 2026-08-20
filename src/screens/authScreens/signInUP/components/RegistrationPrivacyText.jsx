import React, { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { privacyPolicyApi, termsOfUseApi } from '../../../../api';
import { PrivacyPolicyModal } from '../../../../components/account/PrivacyPolicyModal';
import { FONT_FAMILY } from '../../../../theme';
import { useThemedStyles } from '../../../../hooks';

const LEGAL_DOCUMENTS = {
  terms: {
    title: 'Օգտագործման պայմաններ և դրույթներ',
    logKey: 'terms-of-use',
    fetchDocument: () => termsOfUseApi.getTermsOfUse(),
  },
  privacy: {
    title: 'Գաղտնիության քաղաքականություն',
    logKey: 'privacy-policy',
    fetchDocument: () => privacyPolicyApi.getPrivacyPolicy(),
  },
};

export function RegistrationPrivacyText() {
  const styles = useThemedStyles(createStyles);
  const [activeLegalDocument, setActiveLegalDocument] = useState(null);

  const closeLegalModal = useCallback(() => {
    setActiveLegalDocument(null);
  }, []);

  const activeDocument = activeLegalDocument
    ? LEGAL_DOCUMENTS[activeLegalDocument]
    : null;

  return (
    <>
      <Text style={styles.privacyText}>
        Գրանցվելով՝ Դուք համաձայնվում եք{'  '}
        <Text
          style={styles.privacyTextBold}
          onPress={() => setActiveLegalDocument('terms')}
        >
          Օգտագործման պայմաններին և դրույթներին
        </Text>
        {'  '} և{'  '}
        <Text
          style={styles.privacyTextBold}
          onPress={() => setActiveLegalDocument('privacy')}
        >
          Գաղտնիության քաղաքականությանը
        </Text>
      </Text>
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
    privacyText: {
      fontSize: 10,
      lineHeight: 18,
      fontFamily: FONT_FAMILY.regular,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 20,
      textAlign: 'center',
    },
    privacyTextBold: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.icons,
      textDecorationLine: 'underline',
    },
  });
