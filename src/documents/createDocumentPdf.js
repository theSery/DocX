import { Platform } from 'react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import { buildPdfHtmlDocument, getPdfGenerationDefaults } from './buildPdfHtmlDocument';
import { mergeDocumentHtml } from './mergeDocumentHtml';

/**
 * @param {{
 *   backendHtml?: string;
 *   placeholders?: Record<string, string | number>;
 *   slots?: Record<string, string>;
 *   documentHtml?: string;
 *   fileName?: string;
 *   includeBase64?: boolean;
 * }} params
 * @returns {Promise<{ filePath: string; base64?: string }>}
 */
export async function createDocumentPdf({
  backendHtml = '',
  placeholders = {},
  slots = {},
  documentHtml,
  fileName,
  includeBase64 = false,
}) {
  const html =
    documentHtml ??
    buildPdfHtmlDocument(mergeDocumentHtml(backendHtml, { placeholders, slots }));
  const pdfDefaults = getPdfGenerationDefaults();

  const result = await generatePDF({
    html,
    fileName: fileName ?? `document_${Date.now()}`,
    directory: Platform.OS === 'ios' ? 'Documents' : undefined,
    base64: includeBase64,
    width: 595,
    height: 1224,
    ...pdfDefaults,
  });

  if (!result?.filePath) {
    throw new Error('PDF file was not created.');
  }

  return {
    filePath: result.filePath,
    base64: result.base64,
  };
}

/**
 * @param {string} filePath
 */
export function toPdfPreviewUri(filePath) {
  if (!filePath) {
    return '';
  }
  if (filePath.startsWith('file://') || filePath.startsWith('data:')) {
    return filePath;
  }
  return `file://${filePath}`;
}
