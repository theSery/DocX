import { buildPdfHtmlDocument } from './buildPdfHtmlDocument';
import { fillTemplateText, injectSignatureAtPlaceholder } from './fillTemplateText';

/**
 * @param {string} templateText
 * @param {{
 *   personalData?: Record<string, unknown> | null;
 *   documentFill?: Record<string, unknown>;
 * }} sources
 * @param {{ signatureImageSrc?: string }} [options]
 */
export function buildFilledTemplateDocumentHtml(templateText, sources, options = {}) {
  let bodyHtml = fillTemplateText(templateText, sources);

  if (options.signatureImageSrc) {
    bodyHtml = injectSignatureAtPlaceholder(bodyHtml, options.signatureImageSrc);
  }

  return buildPdfHtmlDocument(bodyHtml);
}
