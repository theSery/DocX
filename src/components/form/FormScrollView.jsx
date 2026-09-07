import React, { forwardRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

/** Space kept between the focused input and the top of the keyboard. */
const KEYBOARD_BOTTOM_OFFSET = 24;

const DEFAULT_SCROLL_PROPS = {
  keyboardShouldPersistTaps: 'handled',
  keyboardDismissMode: 'on-drag',
  bottomOffset: KEYBOARD_BOTTOM_OFFSET,
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

/**
 * Drop-in ScrollView for forms. Scrolls the focused field above the keyboard
 * on both iOS and Android via react-native-keyboard-controller.
 */
export const FormScrollView = forwardRef(function FormScrollView(
  { children, style, ...rest },
  ref,
) {
  return (
    <KeyboardAwareScrollView
      ref={ref}
      {...DEFAULT_SCROLL_PROPS}
      {...rest}
      style={[styles.fill, style]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
});

const KeyboardAwareListScroll = forwardRef(function KeyboardAwareListScroll(props, ref) {
  return (
    <KeyboardAwareScrollView
      {...props}
      ref={ref}
      bottomOffset={props.bottomOffset ?? KEYBOARD_BOTTOM_OFFSET}
    />
  );
});

/**
 * Drop-in FlatList for multi-step / long forms with the same keyboard behavior.
 */
export const FormFlatList = forwardRef(function FormFlatList({ style, ...rest }, ref) {
  return (
    <FlatList
      ref={ref}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...rest}
      renderScrollComponent={KeyboardAwareListScroll}
      style={[styles.fill, style]}
    />
  );
});
