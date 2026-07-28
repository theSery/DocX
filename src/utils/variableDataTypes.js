const DAY_OFFSET_PATTERN = /^(\d+)_day$/;

/**
 * @param {string | null | undefined} dataType
 * @returns {number | null}
 */
export function getDayOffset(dataType) {
  if (typeof dataType !== 'string') {
    return null;
  }

  const match = dataType.match(DAY_OFFSET_PATTERN);
  return match ? Number(match[1]) : null;
}

/**
 * @param {string | null | undefined} dataType
 * @returns {boolean}
 */
export function isDateDataType(dataType) {
  return dataType === 'date' || getDayOffset(dataType) != null;
}

/**
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}
