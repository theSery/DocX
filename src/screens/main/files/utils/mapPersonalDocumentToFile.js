export function mapPersonalDocumentToFile(document) {
  return {
    id: String(document.id),
    title: document.documentName,
    documentUrl: document.documentUrl,
    downloadUrl: document.downloadUrl,
    attachedDocumentId: document.attachedDocumentId,
    fileId: document.fileId,
    isDefault: Boolean(document.isDefault),
    isUploaded: Boolean(document.isUploaded),
  };
}
