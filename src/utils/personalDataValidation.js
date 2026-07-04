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

export function isPassportDataCompleteForTemplate(data) {
  if (!data) {
    return false;
  }

  return (
    isNonEmptyString(data.passportSeries) &&
    isNonEmptyString(data.fromWhom) &&
    Boolean(data.dateOfIssue) &&
    isNonEmptyString(data.publicServiceLicensePlate) &&
    isValidArmenianAddress(data.notificationAddress) &&
    isValidArmenianAddress(data.registrationAddress)
  );
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
