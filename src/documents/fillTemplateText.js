import { notificationMethods } from '../data/notificationMethods';
import { findCountryByCitizenship } from '../utils/personalDataValidation';
import { escapeHtml } from './escapeHtml';
import { formatDocumentDate, formatDocumentDateTime } from './formatDocumentDate';
import { isDateDataType } from '../utils/variableDataTypes';

const VARIABLE_SPAN_PATTERN =
  /<span\b[^>]*\bdata-label="([^"]+)"[^>]*>[\s\S]*?<\/span>/gi;

const SIGNATURE_DATE_SPAN_PATTERN =
  /<span\b[^>]*\bdata-label="signature_date"[^>]*>[\s\S]*?<\/span>/gi;

const SIGN_SPAN_PATTERN =
  /<span\b[^>]*\bdata-label="sign"[^>]*>[\s\S]*?<\/span>/gi;

const HTML_VARIABLES = new Set(['past', 'hodvac', 'text2', 'attached_documents']);

// Their default text must never be shown; they are kept as empty anchors so
// injectSignatureAtPlaceholder can place the signature image and date later.
const SIGNATURE_PLACEHOLDER_LABELS = new Set(['sign', 'signature_date']);

const REGISTRATION_ADDRESS_LABEL = 'Հաշվառման հասցե՝';
const NOTIFICATION_ADDRESS_LABEL = 'Ծանուցման հասցե՝';
const REGISTRATION_ADDRESS_DATA_LABEL = 'userRegistrationAddress';
const NOTIFICATION_ADDRESS_DATA_LABEL = 'userNotificationAddress';
const PATRONYMIC_LABEL = 'Հայրանունը՝';
const PATRONYMIC_DATA_LABELS = ['userPatronymic', 'userPatronymics'];

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
 * @param {unknown} value
 */
function hasPatronymicValue(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * @param {string} html
 * @param {Record<string, unknown> | null | undefined} personalData
 */
function applyPatronymicVisibility(html, personalData) {
  if (hasPatronymicValue(personalData?.patronymic)) {
    return html;
  }

  return PATRONYMIC_DATA_LABELS.reduce(
    (nextHtml, dataLabel) =>
      stripUnusedAddressLine(nextHtml, {
        label: PATRONYMIC_LABEL,
        dataLabel,
      }),
    html,
  );
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
 * @param {unknown} document
 */
function getAttachedDocumentName(document) {
  if (typeof document === 'string') {
    return document.trim();
  }

  const nestedName = document?.attachedDocument?.name;
  const name = typeof nestedName === 'string' ? nestedName : document?.name;

  return typeof name === 'string' ? name.trim() : '';
}

/**
 * @param {...({ id?: number; name?: string }[] | undefined)} lists
 */
function mergeAttachedDocuments(...lists) {
  const attachedDocuments = [];
  const seen = new Set();

  lists.forEach(list => {
    (list ?? []).forEach(document => {
      const name = getAttachedDocumentName(document);

      if (!name) {
        return;
      }

      const id =
        document?.attachedDocument?.id ??
        document?.attachedDocumentId ??
        document?.id;
      const key =
        id != null && id !== '' ? `id:${String(id)}` : `name:${name}`;

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      attachedDocuments.push({
        id,
        name,
      });
    });
  });

  return attachedDocuments;
}

/**
 * @param {{ id?: number; name?: string }[]} attachedDocuments
 */
function buildAttachedDocumentsHtml(attachedDocuments) {
  const namedDocuments = mergeAttachedDocuments(attachedDocuments);

  if (!namedDocuments.length) {
    return '';
  }

  return namedDocuments
    .map((document, index) => `${index + 1}. ${escapeHtml(document.name)}`)
    .join('<br/>');
}

/**
 * @param {unknown} value
 */
function isEmptyVariableValue(value) {
  return value == null || (typeof value === 'string' && value.trim() === '');
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
 * @param {unknown} value
 */
function getCitizenshipDisplayName(value) {
  return findCountryByCitizenship(value)?.nameHy ?? '';
}

/**
 * @param {unknown} value
 */
function getNotificationMethodDisplayName(value) {
  if (!value) {
    return '';
  }

  const normalized = String(value).trim().toLowerCase();
  return (
    notificationMethods.find(method => method.id === normalized)?.nameHy ?? ''
  );
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
    userCitizenship: getCitizenshipDisplayName(personalData.citizenship),
    userNotificationMethod: getNotificationMethodDisplayName(
      personalData.notificationMethod,
    ),
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
 *   attachedDocuments?: { id?: number; name?: string }[];
 *   formAttachedDocuments?: { id?: number; name?: string }[];
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
    attached_documents: buildAttachedDocumentsHtml(
      documentFill.formAttachedDocuments,
    ),
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
 *     attachedDocuments?: { id?: number; name?: string }[];
 *     formAttachedDocuments?: { id?: number; name?: string }[];
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
  const templateWithVisibleFields = applyPatronymicVisibility(
    applyNotificationAddressVisibility(templateText, showNotificationAddress),
    personalData,
  );

  const variables = {
    ...mapPersonalDataToVariables(personalData, showNotificationAddress),
    ...mapDocumentFillToVariables(documentFill),
  };

  return templateWithVisibleFields.replace(VARIABLE_SPAN_PATTERN, (match, label) => {
    if (SIGNATURE_PLACEHOLDER_LABELS.has(label)) {
      return `<span data-label="${label}"></span>`;
    }

    if (!(label in variables) || isEmptyVariableValue(variables[label])) {
      return '';
    }

    const value = variables[label];

    if (HTML_VARIABLES.has(label)) {
      return value;
    }

    return escapeHtml(String(value));
  });
}
