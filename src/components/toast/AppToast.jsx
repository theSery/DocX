import React from 'react';
import { StyleSheet } from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT_FAMILY, palette } from '../../theme';

const sharedText1Style = {
  fontSize: 13,
  fontFamily: FONT_FAMILY.regular,
  color: palette.black,
};

const sharedText2Style = {
  fontSize: 12,
  fontFamily: FONT_FAMILY.regular,
  color: palette.gray,
};

const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={[styles.base, styles.success]}
      contentContainerStyle={styles.content}
      text1Style={sharedText1Style}
      text2Style={sharedText2Style}
      text2NumberOfLines={3}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={[styles.base, styles.error]}
      contentContainerStyle={styles.content}
      text1Style={sharedText1Style}
      text2Style={sharedText2Style}
      text2NumberOfLines={3}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      style={[styles.base, styles.info]}
      contentContainerStyle={styles.content}
      text1Style={sharedText1Style}
      text2Style={sharedText2Style}
      text2NumberOfLines={3}
    />
  ),
};

export function AppToast() {
  const insets = useSafeAreaInsets();

  return <Toast config={toastConfig} topOffset={insets.top + 12} />;
}

const styles = StyleSheet.create({
  base: {
    borderLeftWidth: 0,
    borderRadius: 12,
    height: 'auto',
    minHeight: 60,
    paddingVertical: 12,
    width: '92%',
  },
  content: {
    paddingHorizontal: 16,
  },
  success: {
    borderLeftWidth: 7,
    borderLeftColor: palette.green,
    backgroundColor: palette.pureWhite,
  },
  error: {
    borderLeftWidth: 7,
    borderLeftColor: palette.red,
    backgroundColor: palette.pureWhite,
  },
  info: {
    borderLeftColor: palette.mainBlue,
    backgroundColor: palette.pureWhite,
  },
});
