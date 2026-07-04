const PDF_PREVIEW_IMAGE = require('../../../../assets/images/folders.webp');

export function isPdfFile({ type, name }) {
  return (
    type === 'application/pdf' || Boolean(name?.toLowerCase().endsWith('.pdf'))
  );
}

export function getUploadPreviewContent(pickedFile) {
  return isPdfFile(pickedFile) ? PDF_PREVIEW_IMAGE : pickedFile.uri;
}
