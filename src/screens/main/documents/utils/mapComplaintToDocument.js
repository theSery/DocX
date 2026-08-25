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

export function resolveAttachedDocuments(attachedDocuments) {
  if (!Array.isArray(attachedDocuments)) {
    return [];
  }

  return attachedDocuments.filter(item => item != null && item !== '');
}

function matchesAttachedReference(doc, attachedIds) {
  return [doc?.attachedDocumentId, doc?.id, doc?.fileId].some(
    value => value != null && attachedIds.has(String(value)),
  );
}

export function buildSendAttachedDocuments(files) {
  return (files ?? [])
    .map(file => ({
      id: file?.fileId ?? file?.id,
      documentName:
        file?.documentName ?? file?.fileName ?? file?.name ?? '',
    }))
    .filter(doc => doc.id != null);
}

export function resolveSendAttachedDocuments(attachedReferences, personalDocuments) {
  const objectPayload = buildSendAttachedDocuments(
    (attachedReferences ?? []).filter(item => typeof item === 'object' && item != null),
  ).filter(doc => doc.documentName);

  if (objectPayload.length > 0) {
    return objectPayload;
  }

  const attachedIds = new Set(
    resolveAttachedDocumentIds(attachedReferences).map(String),
  );

  if (attachedIds.size === 0) {
    return [];
  }

  const matchedFiles = (personalDocuments ?? []).filter(doc => {
    const isUploaded =
      Boolean(doc?.isUploaded) ||
      Boolean(doc?.documentUrl) ||
      Boolean(doc?.downloadUrl);

    return isUploaded && matchesAttachedReference(doc, attachedIds);
  });

  return buildSendAttachedDocuments(matchedFiles);
}

export function mapComplaintToDocument(complaint) {
  const attachedDocuments = resolveAttachedDocuments(
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
