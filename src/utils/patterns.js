export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ARMENIAN_LETTERS_PATTERN = /^[\u0531-\u0556\u0561-\u0587\s\-]+$/;

export const ARMENIAN_NAME_RULES = {
  required: 'Անունը պարտադիր է',
  pattern: {
    value: ARMENIAN_LETTERS_PATTERN,
    message: 'Մուտքագրեք միայն հայերեն տառեր',
  },
};

export const PHONE_NUMBER_PATTERN = /^(\+374\d{8})$/;