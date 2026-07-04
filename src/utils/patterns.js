export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ARMENIAN_LETTERS_PATTERN = /^[\u0531-\u0556\u0561-\u0587\s\-]+$/;

export const ARMENIAN_ADDRESS_PATTERN = /^[\u0531-\u0556\u0561-\u05870-9\s\-,.]+$/;

export const ARMENIAN_NAME_RULES = {
  required: 'Անունը պարտադիր է',
  pattern: {
    value: ARMENIAN_LETTERS_PATTERN,
    message: 'Մուտքագրեք միայն հայերեն տառեր',
  },
};

export const ARMENIAN_ADDRESS_RULES = {
  required: 'Հասցեն պարտադիր է',
  pattern: {
    value: ARMENIAN_ADDRESS_PATTERN,
    message: 'Մուտքագրեք հասցեն հայերեն',
  },
};

export const PHONE_NUMBER_PATTERN = /^(\+374\d{8})$/;

export const PASSWORD_PATTERN = /^[a-zA-Z0-9]{8,}$/;