import { escapeHtml } from './escapeHtml';
import { formatDocumentDate, formatDocumentDateTime } from './formatDocumentDate';
import { isDateDataType } from '../utils/variableDataTypes';

const VARIABLE_SPAN_PATTERN =
  /<span\b[^>]*\bdata-label="([^"]+)"[^>]*>[\s\S]*?<\/span>/gi;

const SIGNATURE_DATE_SPAN_PATTERN =
  /<span\b[^>]*\bdata-label="signature_date"[^>]*>[\s\S]*?<\/span>/gi;

const SIGN_SPAN_PATTERN =
  /<span\b[^>]*\bdata-label="sign"[^>]*>[\s\S]*?<\/span>/gi;

const HTML_VARIABLES = new Set(['past', 'hodvac', 'text2']);

// Their default text must never be shown; they are kept as empty anchors so
// injectSignatureAtPlaceholder can place the signature image and date later.
const SIGNATURE_PLACEHOLDER_LABELS = new Set(['sign', 'signature_date']);

const REGISTRATION_ADDRESS_LABEL = 'Հաշվառման հասցե՝';
const NOTIFICATION_ADDRESS_LABEL = 'Ծանուցման հասցե՝';
const REGISTRATION_ADDRESS_DATA_LABEL = 'userRegistrationAddress';
const NOTIFICATION_ADDRESS_DATA_LABEL = 'userNotificationAddress';

/**
 * @param {string} value
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Removes the unused address line (label + value) from template HTML.
 *
 * @param {string} html
 * @param {{ label: string; dataLabel: string }} unusedAddress
 */
function stripUnusedAddressLine(html, { label, dataLabel }) {
  const unusedSpanMarker = `data-label="${dataLabel}"`;

  let nextHtml = html.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, paragraph => {
    if (paragraph.includes(label) || paragraph.includes(unusedSpanMarker)) {
      return '';
    }

    return paragraph;
  });

  const leftoverLabeledSpanPattern = new RegExp(
    `${escapeRegExp(label)}\\s*<span\\b[^>]*\\bdata-label="${escapeRegExp(dataLabel)}"[^>]*>[\\s\\S]*?<\\/span>`,
    'gi',
  );
  nextHtml = nextHtml.replace(leftoverLabeledSpanPattern, '');

  const leftoverSpanPattern = new RegExp(
    `<span\\b[^>]*\\bdata-label="${escapeRegExp(dataLabel)}"[^>]*>[\\s\\S]*?<\\/span>`,
    'gi',
  );
  nextHtml = nextHtml.replace(leftoverSpanPattern, '');

  return nextHtml.replace(new RegExp(`${escapeRegExp(label)}\\s*`, 'g'), '');
}

/**
 * @param {string} html
 * @param {boolean} hasNotificationAddress
 */
function applyNotificationAddressVisibility(html, hasNotificationAddress) {
  if (hasNotificationAddress) {
    return stripUnusedAddressLine(html, {
      label: REGISTRATION_ADDRESS_LABEL,
      dataLabel: REGISTRATION_ADDRESS_DATA_LABEL,
    });
  }

  return stripUnusedAddressLine(html, {
    label: NOTIFICATION_ADDRESS_LABEL,
    dataLabel: NOTIFICATION_ADDRESS_DATA_LABEL,
  });
}

/**
 * @param {string} html
 */
function stripOuterParagraph(html) {
  const trimmed = html.trim();
  const match = trimmed.match(/^<p[^>]*>([\s\S]*)<\/p>$/i);
  return match ? match[1].trim() : trimmed;
}

/**
 * @param {string[]} items
 */
function buildNumberedHtmlList(items) {
  if (!items?.length) {
    return '';
  }

  return items
    .map((item, index) => {
      const content = stripOuterParagraph(item);
      return `<p style="text-align: justify;">${index + 1}. ${content}</p>`;
    })
    .join('');
}

/**
 * @param {string[]} items
 */
function joinHtmlBlocks(items) {
  if (!items?.length) {
    return '';
  }

  return items.join('');
}

/**
 * @param {Record<string, unknown> | null | undefined} personalData
 * @param {boolean} hasNotificationAddress
 */
function mapPersonalDataToVariables(personalData, hasNotificationAddress) {
  if (!personalData) {
    return {};
  }

  const dateOfIssue = formatDocumentDate(personalData.dateOfIssue);

  return {
    userName: personalData.name ?? '',
    userSurname: personalData.surname ?? '',
    userPatronymic: personalData.patronymic ?? '',
    userPatronymics: personalData.patronymic ?? '',
    userPassportSeries: personalData.passportSeries ?? '',
    userDateOfIssue: dateOfIssue,
    userDataOfIssue: dateOfIssue,
    userFromWhom: personalData.fromWhom ?? '',
    userRegistrationAddress: hasNotificationAddress
      ? ''
      : (personalData.registrationAddress ?? ''),
    userNotificationAddress: hasNotificationAddress
      ? (personalData.notificationAddress ?? '')
      : '',
    userPhoneNumber: personalData.phoneNumber ?? '',
    userEmail: personalData.email ?? '',
  };
}

/**
 * @param {{
 *   variableValues?: Record<string, unknown>;
 *   variableDataTypes?: Record<string, string>;
 *   past?: string[];
 *   text2?: string[];
 *   articles?: string[];
 * }} [documentFill]
 */
function mapDocumentFillToVariables(documentFill = {}) {
  const analyticalHtml = joinHtmlBlocks(documentFill.text2);
  const articlesHtml = joinHtmlBlocks(documentFill.articles);
  const configuredVariables = Object.fromEntries(
    Object.entries(documentFill.variableValues ?? {}).map(([name, value]) => [
      name,
      isDateDataType(documentFill.variableDataTypes?.[name])
        ? formatDocumentDate(value)
        : value ?? '',
    ]),
  );

  return {
    ...configuredVariables,
    past: buildNumberedHtmlList(documentFill.past),
    hodvac: [analyticalHtml, articlesHtml].filter(Boolean).join(''),
    text2: analyticalHtml,
  };
}

/**
 * @param {string} templateText
 * @param {string} imageSrc Data URI or URL for the signature image.
 */
export function injectSignatureAtPlaceholder(templateText, imageSrc) {
  if (!templateText || !imageSrc) {
    return templateText ?? '';
  }

  const date = formatDocumentDateTime(new Date());
  const signatureImage = `<span style="display:block; text-align:center;" data-signature="true"><img class="signature" src="${imageSrc}" alt="signature" style="max-width:150px; height:auto; width:auto; object-fit:contain;" /></span>`;
  const signatureDate = `<span style="display:inline-block" data-signature-date="true">${escapeHtml(date)}</span>`;

  return templateText
    .replace(SIGN_SPAN_PATTERN, signatureImage)
    .replace(SIGNATURE_DATE_SPAN_PATTERN, signatureDate);
}

/**
 * Replaces `<span data-label="...">` variables in backend template HTML.
 *
 * @param {string} templateText
 * @param {{
 *   personalData?: Record<string, unknown> | null;
 *   documentFill?: {
 *     variableValues?: Record<string, unknown>;
 *     variableDataTypes?: Record<string, string>;
 *     past?: string[];
 *     text2?: string[];
 *     articles?: string[];
 *   };
 *   hasNotificationAddress?: boolean;
 * }} sources
 */
export function fillTemplateText(
  templateText,
  { personalData, documentFill, hasNotificationAddress } = {},
) {
  if (!templateText) {
    return '';
  }

  const showNotificationAddress = Boolean(
    hasNotificationAddress ?? personalData?.hasNotificationAddress,
  );
  const templateWithVisibleAddress = applyNotificationAddressVisibility(
    templateText,
    showNotificationAddress,
  );

  const variables = {
    ...mapPersonalDataToVariables(personalData, showNotificationAddress),
    ...mapDocumentFillToVariables(documentFill),
  };

  return templateWithVisibleAddress.replace(VARIABLE_SPAN_PATTERN, (match, label) => {
    if (SIGNATURE_PLACEHOLDER_LABELS.has(label)) {
      return `<span data-label="${label}"></span>`;
    }

    if (!(label in variables)) {
      return match;
    }

    const value = variables[label];

    if (HTML_VARIABLES.has(label)) {
      return value || '';
    }

    return escapeHtml(String(value ?? ''));
  });
}
