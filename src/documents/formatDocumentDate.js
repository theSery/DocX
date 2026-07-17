/**
 * @param {Date | string | null | undefined} value
 * @returns {string}
 */
export function formatDocumentDate(value) {
  if (value == null || value === '') {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Formats as `DD.MM.YYYY HH:mm`, matching the web signature date format.
 * @param {Date | string | null | undefined} value
 * @returns {string}
 */
export function formatDocumentDateTime(value) {
  if (value == null || value === '') {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${formatDocumentDate(date)} ${hours}:${minutes}`;
}
