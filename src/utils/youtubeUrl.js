const YOUTUBE_ID_PATTERN = /[a-zA-Z0-9_-]{11}/;

/**
 * Extracts a YouTube video id from common URL formats.
 * @param {string | undefined | null} url
 * @returns {string | null}
 */
export function getYoutubeVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) {
    return shortMatch[1];
  }

  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) {
    return watchMatch[1];
  }

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) {
    return embedMatch[1];
  }

  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) {
    return shortsMatch[1];
  }

  if (YOUTUBE_ID_PATTERN.test(trimmed) && trimmed.length === 11) {
    return trimmed;
  }

  return null;
}
