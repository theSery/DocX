import { countries } from '../data/countries';
import { notificationMethods } from '../data/notificationMethods';
import {
  ARMENIAN_ADDRESS_PATTERN,
  ARMENIAN_LETTERS_PATTERN,
  PHONE_NUMBER_PATTERN,
} from './patterns';

function isValidArmenianName(value) {
  const trimmed = value?.trim();
  return Boolean(trimmed && ARMENIAN_LETTERS_PATTERN.test(trimmed));
}

function isValidArmenianAddress(value) {
  const trimmed = value?.trim();
  return Boolean(trimmed && ARMENIAN_ADDRESS_PATTERN.test(trimmed));
}

function isValidPhoneNumber(value) {
  const trimmed = value?.trim();
  return Boolean(trimmed && PHONE_NUMBER_PATTERN.test(trimmed));
}

function isNonEmptyString(value) {
  return Boolean(value?.trim());
}

export function toCitizenshipValue(country) {
  return country?.nameEn?.trim().toLowerCase() ?? '';
}

export function findCountryByCitizenship(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  return (
    countries.find(country => toCitizenshipValue(country) === normalized) ??
    null
  );
}

export function isArmenianCitizenship(value) {
  return findCountryByCitizenship(value)?.nameEn === 'Armenia';
}

function isValidCitizenship(value) {
  return Boolean(findCountryByCitizenship(value));
}

function isValidNotificationMethod(value) {
  return notificationMethods.some(method => method.id === value);
}

export function getMaximumBirthDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  date.setHours(23, 59, 59, 999);
  return date;
}

export const BIRTH_DATE_RULES = {
  required: 'Ծննդյան ամսաթիվը պարտադիր է',
  validate: value => {
    if (!(value instanceof Date)) {
      return 'Ծննդյան ամսաթիվը պարտադիր է';
    }

    const maximumBirthDate = getMaximumBirthDate();
    return (
      value <= maximumBirthDate ||
      'Դուք պետք է լինեք առնվազն 18 տարեկան'
    );
  },
};

export function isPersonalDataCompleteForTemplate(data) {
  if (!data) {
    return false;
  }

  return (
    isValidCitizenship(data.citizenship) &&
    isValidNotificationMethod(data.notificationMethod) &&
    isValidArmenianName(data.name) &&
    isValidArmenianName(data.surname) &&
    (!isArmenianCitizenship(data.citizenship) ||
      isValidArmenianName(data.patronymic)) &&
    Boolean(data.birthday) &&
    isValidPhoneNumber(data.phoneNumber)
  );
}

export function isPassportDataCompleteForTemplate(
  data,
  hasNotificationAddress = false,
) {
  if (!data) {
    return false;
  }

  const isComplete =
    isNonEmptyString(data.passportSeries) &&
    isNonEmptyString(data.fromWhom) &&
    Boolean(data.dateOfIssue) &&
    isNonEmptyString(data.publicServiceLicensePlate) &&
    isValidArmenianAddress(data.registrationAddress);

  if (!isComplete) {
    return false;
  }

  // Documents only use notificationAddress when hasNotificationAddress is true.
  if (!hasNotificationAddress) {
    return true;
  }

  return isValidArmenianAddress(data.notificationAddress);
}

export const PERSONAL_DATA_FIELD_VALIDATORS = {
  citizenship: isValidCitizenship,
  notificationMethod: isValidNotificationMethod,
  name: isValidArmenianName,
  surname: isValidArmenianName,
  patronymic: (value, data) =>
    !isArmenianCitizenship(data?.citizenship) || isValidArmenianName(value),
  birthday: value => Boolean(value),
  phoneNumber: isValidPhoneNumber,
  passportSeries: isNonEmptyString,
  fromWhom: isNonEmptyString,
  dateOfIssue: value => Boolean(value),
  publicServiceLicensePlate: isNonEmptyString,
  // Non-Armenian or empty addresses are treated as incomplete so fields are shown.
  registrationAddress: isValidArmenianAddress,
  notificationAddress: isValidArmenianAddress,
};

export function getIncompletePersonalDataFields(data) {
  return Object.entries(PERSONAL_DATA_FIELD_VALIDATORS)
    .filter(([field, isValid]) => !isValid(data?.[field], data))
    .map(([field]) => field);
}

export const PROFILE_INFO_FIELD_NAMES = [
  'email',
  'name',
  'lastName',
  'patronymic',
  'birthDate',
  'phone',
];

export const PASSPORT_INFO_FIELD_NAMES = [
  'passportSeries',
  'fromWhom',
  'dateOfIssue',
  'publicServiceLicensePlate',
  'notificationAddress',
  'registrationAddress',
];
