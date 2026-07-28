/**
 * Stable cache identity for remote icons.
 * Signed S3 URLs rotate query params; strip them so cache survives refreshes.
 *
 * @param {string | null | undefined} url
 * @returns {string | null}
 */
export function getStableImageKey(url) {
  if (typeof url !== 'string' || !url) {
    return null;
  }

  const withoutQuery = url.split('?')[0].split('#')[0];
  if (!withoutQuery) {
    return null;
  }

  let path = withoutQuery;
  try {
    path = decodeURIComponent(withoutQuery.replace(/^https?:\/\/[^/]+/i, ''));
  } catch {
    path = withoutQuery.replace(/^https?:\/\/[^/]+/i, '');
  }

  const sanitized = path
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9._/-]+/g, '_')
    .replace(/\/+/g, '_');

  if (!sanitized) {
    return null;
  }

  // Keep the filename-heavy tail unique while staying within filesystem limits.
  return sanitized.length > 180 ? sanitized.slice(-180) : sanitized;
}
