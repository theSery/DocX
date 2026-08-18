const ARMENIAN_MONTHS = [
  'Հունվար',
  'Փետրվար',
  'Մարտ',
  'Ապրիլ',
  'Մայիս',
  'Հունիս',
  'Հուլիս',
  'Օգոստոս',
  'Սեպտեմբեր',
  'Հոկտեմբեր',
  'Նոյեմբեր',
  'Դեկտեմբեր',
];

function formatArmenianDate(value) {
  if (value == null || value === '') {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getDate()} ${ARMENIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function resolveCategory(complaint) {
  if (complaint.recipientType === 'lawyer') {
    return 'lawyer';
  }

  if (complaint.recipientType === 'addressee') {
    return 'state';
  }

  if (complaint.sendDate) {
    return 'email';
  }

  return 'state';
}

export function resolveAttachedDocumentIds(attachedDocuments) {
  if (!Array.isArray(attachedDocuments)) {
    return [];
  }

  return attachedDocuments
    .map(item => {
      if (item == null || item === '') {
        return null;
      }

      if (typeof item === 'object') {
        return item.id ?? item.attachedDocumentId ?? null;
      }

      return item;
    })
    .filter(id => id != null);
}

export function mapComplaintToDocument(complaint) {
  const attachedDocuments = resolveAttachedDocumentIds(
    complaint.attachedDocuments,
  );

  return {
    id: String(complaint.id),
    sendDate: complaint.sendDate ? formatArmenianDate(complaint.sendDate) : '—',
    title: complaint.documentName,
    organization: complaint.recipientValue || '—',
    status: complaint.sendDate ? 'sent' : 'draft',
    attachedDocuments,
    hasAttachment: attachedDocuments.length > 0,
    category: resolveCategory(complaint),
    fileUrl: complaint.fileUrl,
    downloadUrl: complaint.downloadUrl,
  };
}
