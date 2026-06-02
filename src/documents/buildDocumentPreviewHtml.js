import { buildPdfHtmlDocument } from './buildPdfHtmlDocument';
import { mergeDocumentHtml } from './mergeDocumentHtml';

/**
 * Builds the same HTML used for PDF generation — suitable for an in-app preview
 * with a typewriter animation before showing the rendered PDF.
 *
 * @param {{
 *   backendHtml: string;
 *   placeholders?: Record<string, string | number>;
 *   slots?: Record<string, string>;
 * }} params
 */
export function buildDocumentPreviewHtml({
  backendHtml,
  placeholders = {},
  slots = {},
}) {
  const mergedBody = mergeDocumentHtml(backendHtml, { placeholders, slots });
  return buildPdfHtmlDocument(mergedBody);
}
