import { escapeHtml } from './escapeHtml';
import { formatDocumentDate, formatDocumentDateTime } from './formatDocumentDate';

const VARIABLE_SPAN_PATTERN =
  /<span\b[^>]*\bdata-label="([^"]+)"[^>]*>[\s\S]*?<\/span>/gi;

const SIGNATURE_DATE_SPAN_PATTERN =
  /<span\b[^>]*\bdata-label="signature_date"[^>]*>[\s\S]*?<\/span>/gi;

const HTML_VARIABLES = new Set(['past', 'hodvac', 'text2']);

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
 */
function mapPersonalDataToVariables(personalData) {
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
    userRegistrationAddress: personalData.registrationAddress ?? '',
    userNotificationAddress: personalData.notificationAddress ?? '',
    userPhoneNumber: personalData.phoneNumber ?? '',
    userEmail: personalData.email ?? '',
  };
}

/**
 * @param {{
 *   Act_number?: string;
 *   Act_date?: string | null;
 *   past?: string[];
 *   text2?: string[];
 *   articles?: string[];
 * }} [documentFill]
 */
function mapDocumentFillToVariables(documentFill = {}) {
  const analyticalHtml = joinHtmlBlocks(documentFill.text2);
  const articlesHtml = joinHtmlBlocks(documentFill.articles);

  return {
    Act_number: documentFill.Act_number ?? '',
    Act_date: formatDocumentDate(documentFill.Act_date),
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
  const replacement = `<img src="${imageSrc}" alt="signature" style="max-width:200px; height:auto; display:inline-block;" data-signature="true" /><span style="display:inline-block" data-signature-date="true">${escapeHtml(date)}</span>`;

  return templateText.replace(SIGNATURE_DATE_SPAN_PATTERN, replacement);
}

/**
 * Replaces `<span data-label="...">` variables in backend template HTML.
 *
 * @param {string} templateText
 * @param {{
 *   personalData?: Record<string, unknown> | null;
 *   documentFill?: {
 *     Act_number?: string;
 *     Act_date?: string | null;
 *     past?: string[];
 *     text2?: string[];
 *     articles?: string[];
 *   };
 * }} sources
 */
export function fillTemplateText(templateText, { personalData, documentFill } = {}) {
  if (!templateText) {
    return '';
  }

  const variables = {
    ...mapPersonalDataToVariables(personalData),
    ...mapDocumentFillToVariables(documentFill),
  };

  return templateText.replace(VARIABLE_SPAN_PATTERN, (match, label) => {
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
