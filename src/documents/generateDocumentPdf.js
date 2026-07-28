import { Platform } from 'react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { getPdfGenerationDefaults } from './buildPdfHtmlDocument';
import { isShareCancelled } from './downloadRemotePdf';

/**
 * @param {{
 *   documentHtml: string;
 *   fileName?: string;
 * }} params
 * @returns {Promise<{ filePath: string; base64?: string }>}
 */
export async function generateDocumentPdf({ documentHtml, fileName }) {
  const pdfDefaults = getPdfGenerationDefaults();

  const result = await generatePDF({
    html: documentHtml,
    fileName: fileName ?? `document_${Date.now()}`,
    directory: Platform.OS === 'ios' ? 'Documents' : undefined,
    base64: false,
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
 * Renders document HTML as a PDF and opens the system share sheet
 * so the user can save or send the file.
 *
 * @param {{
 *   documentHtml: string;
 *   fileName?: string;
 * }} params
 * @returns {Promise<{ filePath: string; base64?: string }>}
 */
export async function generateAndShareDocumentPdf({ documentHtml, fileName }) {
  const result = await generateDocumentPdf({ documentHtml, fileName });

  const shareUrl =
    Platform.OS === 'android' && !result.filePath.startsWith('file://')
      ? `file://${result.filePath}`
      : result.filePath;

  try {
    await Share.open({
      url: shareUrl,
      type: 'application/pdf',
      failOnCancel: false,
      showAppsToView: true,
    });
  } catch (error) {
    if (!isShareCancelled(error)) {
      throw error;
    }
  }

  return result;
}
