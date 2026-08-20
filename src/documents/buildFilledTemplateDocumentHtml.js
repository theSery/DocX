import { buildPdfHtmlDocument } from './buildPdfHtmlDocument';
import { fillTemplateText, injectSignatureAtPlaceholder } from './fillTemplateText';

/**
 * @param {string} templateText
 * @param {{
 *   personalData?: Record<string, unknown> | null;
 *   documentFill?: Record<string, unknown>;
 *   hasNotificationAddress?: boolean;
 * }} sources
 * @param {{ signatureImageSrc?: string }} [options]
 */
export function buildFilledTemplateBodyHtml(templateText, sources, options = {}) {
  let bodyHtml = fillTemplateText(templateText, sources);

  if (options.signatureImageSrc) {
    bodyHtml = injectSignatureAtPlaceholder(bodyHtml, options.signatureImageSrc);
  }

  return bodyHtml;
}

/**
 * @param {string} templateText
 * @param {{
 *   personalData?: Record<string, unknown> | null;
 *   documentFill?: Record<string, unknown>;
 *   hasNotificationAddress?: boolean;
 * }} sources
 * @param {{ signatureImageSrc?: string }} [options]
 */
export function buildFilledTemplateDocumentHtml(templateText, sources, options = {}) {
  return buildPdfHtmlDocument(buildFilledTemplateBodyHtml(templateText, sources, options));
}
