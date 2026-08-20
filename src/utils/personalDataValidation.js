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

export function isPersonalDataCompleteForTemplate(data) {
  if (!data) {
    return false;
  }

  return (
    isValidArmenianName(data.name) &&
    isValidArmenianName(data.surname) &&
    isValidArmenianName(data.patronymic) &&
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
  name: isValidArmenianName,
  surname: isValidArmenianName,
  patronymic: isValidArmenianName,
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
    .filter(([field, isValid]) => !isValid(data?.[field]))
    .map(([field]) => field);
}

export const PROFILE_INFO_FIELD_NAMES = [
  'email',
  'name',
  'lastName',
  'middleName',
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
