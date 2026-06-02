import { Platform } from 'react-native';
import Share from 'react-native-share';
import { createDocumentPdf } from './createDocumentPdf';

/**
 * Merges backend HTML with client data, renders a PDF, and opens the system share sheet
 * so the user can save or send the file.
 *
 * @param {{
 *   backendHtml: string;
 *   placeholders?: Record<string, string | number>;
 *   slots?: Record<string, string>;
 *   fileName?: string;
 * }} params
 * @returns {Promise<{ filePath: string; base64?: string }>}
 */
export async function generateAndShareDocumentPdf({
  backendHtml,
  placeholders = {},
  slots = {},
  fileName,
}) {
  const result = await createDocumentPdf({
    backendHtml,
    placeholders,
    slots,
    fileName,
    includeBase64: false,
  });

  const shareUrl =
    Platform.OS === 'android' && !result.filePath.startsWith('file://')
      ? `file://${result.filePath}`
      : result.filePath;

  await Share.open({
    url: shareUrl,
    type: 'application/pdf',
    failOnCancel: false,
    showAppsToView: true,
  });

  return result;
}
