import { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAvoidingView as KeyboardControllerAvoidingView } from 'react-native-keyboard-controller';

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

/**
 * App-wide keyboard avoidance wrapper.
 *
 * Defaults match react-native-keyboard-controller guidance for both platforms:
 * `behavior="padding"` and `automaticOffset` so headers, modals, and safe areas
 * are accounted for. Any KeyboardAvoidingView prop can be overridden per usage.
 */
export const KeyboardAvoidingView = forwardRef(function KeyboardAvoidingView(
  { behavior = 'padding', automaticOffset = true, style, ...rest },
  ref,
) {
  return (
    <KeyboardControllerAvoidingView
      ref={ref}
      behavior={behavior}
      automaticOffset={automaticOffset}
      style={[styles.fill, style]}
      {...rest}
    />
  );
});
