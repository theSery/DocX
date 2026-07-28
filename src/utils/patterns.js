export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ARMENIAN_LETTERS_PATTERN = /^[\u0531-\u0556\u0561-\u0587\s\-]+$/;

/** Armenian capital + small letters only. */
export const ARMENIAN_LETTER_CHARS_REGEX = /[\u0531-\u0556\u0561-\u0587]/g;

/**
 * True when the value contains letters from another language
 * (Latin, Cyrillic, etc.). Numbers and symbols are ignored.
 */
export function hasNonArmenianLetters(value) {
  const remainder = String(value ?? '').replace(ARMENIAN_LETTER_CHARS_REGEX, '');
  return /\p{L}/u.test(remainder);
}

/**
 * Kept for callers that still use `.test()`. Allows numbers/symbols and
 * Armenian letters; rejects other alphabets.
 */
export const ARMENIAN_ADDRESS_PATTERN = {
  test(value) {
    const trimmed = String(value ?? '').trim();
    return Boolean(trimmed) && !hasNonArmenianLetters(trimmed);
  },
};

export const ARMENIAN_ADDRESS_MESSAGE = 'Մուտքագրեք հասցեն հայերեն';

export const ARMENIAN_NAME_RULES = {
  required: 'Անունը պարտադիր է',
  pattern: {
    value: ARMENIAN_LETTERS_PATTERN,
    message: 'Մուտքագրեք միայն հայերեն տառեր',
  },
};

export const ARMENIAN_ADDRESS_RULES = {
  required: 'Հասցեն պարտադիր է',
  validate: (value) =>
    !String(value ?? '').trim() ||
    !hasNonArmenianLetters(value) ||
    ARMENIAN_ADDRESS_MESSAGE,
  // Kept for UI helpers that read `.pattern.message`.
  pattern: {
    message: ARMENIAN_ADDRESS_MESSAGE,
  },
};

export const PHONE_NUMBER_PATTERN = /^(\+374\d{8})$/;

export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export const PASSWORD_STRENGTH_RULE = {
  pattern: {
    value: PASSWORD_PATTERN,
    message:
      'Գաղտնաբառը պետք է պարունակի գոնե մեկ փոքրատառ, մեկ մեծատառ և մեկ թիվ',
  },
};