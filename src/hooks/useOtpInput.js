import { useCallback, useEffect, useRef, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { AppState } from 'react-native';

export const DEFAULT_OTP_LENGTH = 6;

/**
 * Extracts an OTP code from free-form text (clipboard, paste, AutoFill).
 *
 * @param {boolean} [options.strict] When true (clipboard auto-read), only
 * accept an unambiguous full-length code so phone numbers are not applied.
 */
export function extractOtpCode(
  text,
  length = DEFAULT_OTP_LENGTH,
  { strict = false } = {},
) {
  if (text == null) {
    return null;
  }

  const source = String(text).trim();
  if (!source) {
    return null;
  }

  const digitRuns = source.match(/\d+/g) ?? [];
  if (digitRuns.length === 1 && digitRuns[0].length === length) {
    return digitRuns[0];
  }

  const onlyDigits = source.replace(/\D/g, '');
  if (onlyDigits.length === length) {
    return onlyDigits;
  }

  if (strict) {
    return null;
  }

  if (onlyDigits.length > length) {
    return onlyDigits.slice(0, length);
  }

  return onlyDigits.length > 0 ? onlyDigits : null;
}

function createEmptyDigits(length) {
  return Array.from({ length }, () => '');
}

/**
 * Shared OTP input state: digit boxes, paste handling, and clipboard AutoFill
 * when the user copies a code (e.g. from Gmail) and returns to the app.
 */
export function useOtpInput({
  length = DEFAULT_OTP_LENGTH,
  autoReadClipboard = true,
} = {}) {
  const [digits, setDigits] = useState(() => createEmptyDigits(length));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const digitsRef = useRef(digits);
  const lastClipboardCodeRef = useRef(null);

  useEffect(() => {
    digitsRef.current = digits;
  }, [digits]);

  const code = digits.join('');
  const isComplete = code.length === length && digits.every(Boolean);

  const applyCode = useCallback(
    raw => {
      const extracted = extractOtpCode(raw, length);
      if (!extracted) {
        return false;
      }

      const next = createEmptyDigits(length);
      extracted.split('').forEach((digit, index) => {
        if (index < length) {
          next[index] = digit;
        }
      });

      setDigits(next);
      digitsRef.current = next;

      const focusTo = Math.min(extracted.length, length) - 1;
      setFocusedIndex(Math.max(0, focusTo));
      return true;
    },
    [length],
  );

  const handleChangeDigit = useCallback(
    (index, value) => {
      const cleaned = String(value ?? '').replace(/\D/g, '');

      if (cleaned.length > 1) {
        applyCode(cleaned);
        return;
      }

      setDigits(prev => {
        const next = [...prev];
        next[index] = cleaned;
        digitsRef.current = next;
        return next;
      });
    },
    [applyCode],
  );

  const reset = useCallback(() => {
    const empty = createEmptyDigits(length);
    setDigits(empty);
    digitsRef.current = empty;
    setFocusedIndex(0);
    lastClipboardCodeRef.current = null;
  }, [length]);

  const tryPasteFromClipboard = useCallback(async () => {
    if (!autoReadClipboard) {
      return false;
    }

    try {
      const content = await Clipboard.getString();
      const extracted = extractOtpCode(content, length, { strict: true });

      // Only auto-fill when clipboard looks like a full OTP code.
      if (!extracted || extracted.length !== length) {
        return false;
      }

      if (lastClipboardCodeRef.current === extracted) {
        return false;
      }

      const current = digitsRef.current.join('');
      // Don't overwrite a code the user already finished entering.
      if (current.length === length) {
        return false;
      }

      lastClipboardCodeRef.current = extracted;
      const applied = applyCode(extracted);
      if (applied) {
        // Clear so a stale OTP is not re-applied after reset / new code.
        Clipboard.setString('');
      }
      return applied;
    } catch {
      return false;
    }
  }, [autoReadClipboard, applyCode, length]);

  useEffect(() => {
    if (!autoReadClipboard) {
      return undefined;
    }

    tryPasteFromClipboard();

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        tryPasteFromClipboard();
      }
    });

    return () => subscription.remove();
  }, [autoReadClipboard, tryPasteFromClipboard]);

  return {
    length,
    digits,
    code,
    isComplete,
    focusedIndex,
    setFocusedIndex,
    handleChangeDigit,
    applyCode,
    reset,
    tryPasteFromClipboard,
    inputProps: {
      digits,
      onChangeDigit: handleChangeDigit,
      focusedIndex,
      onFocusIndex: setFocusedIndex,
      length,
    },
  };
}
