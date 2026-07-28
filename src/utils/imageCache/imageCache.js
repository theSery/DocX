import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { getStableImageKey } from './cacheKey';

const CACHE_DIR = `${RNFS.CachesDirectoryPath}/docx-icons`;

/** @type {Map<string, string>} stableKey → file URI */
const memoryCache = new Map();

/** @type {Map<string, Promise<string | null>>} */
const inFlight = new Map();

let dirReady = null;

function toFileUri(path) {
  if (!path) {
    return null;
  }
  if (path.startsWith('file://')) {
    return path;
  }
  return Platform.OS === 'android' ? `file://${path}` : path;
}

function getLocalPath(key) {
  return `${CACHE_DIR}/${key}`;
}

async function ensureCacheDir() {
  if (!dirReady) {
    dirReady = (async () => {
      const exists = await RNFS.exists(CACHE_DIR);
      if (!exists) {
        await RNFS.mkdir(CACHE_DIR);
      }
    })().catch(error => {
      dirReady = null;
      throw error;
    });
  }
  return dirReady;
}

/**
 * Sync lookup after a prior prefetch/hydrate.
 * @param {string | null | undefined} url
 * @returns {string | null}
 */
export function getCachedUriSync(url) {
  const key = getStableImageKey(url);
  if (!key) {
    return null;
  }
  return memoryCache.get(key) ?? null;
}

/**
 * Resolve a remote icon to a local file URI when present on disk.
 * @param {string | null | undefined} url
 * @returns {Promise<string | null>}
 */
export async function getCachedUri(url) {
  const key = getStableImageKey(url);
  if (!key) {
    return null;
  }

  const cached = memoryCache.get(key);
  if (cached) {
    return cached;
  }

  try {
    await ensureCacheDir();
    const path = getLocalPath(key);
    if (await RNFS.exists(path)) {
      const uri = toFileUri(path);
      memoryCache.set(key, uri);
      return uri;
    }
  } catch {
    // Fall through to miss.
  }

  return null;
}

/**
 * Download an image into the disk cache. Idempotent; keyed by stable path.
 * @param {string | null | undefined} url
 * @returns {Promise<string | null>} local file URI or null on failure
 */
export async function prefetchImage(url) {
  if (typeof url !== 'string' || !url) {
    return null;
  }

  const key = getStableImageKey(url);
  if (!key) {
    return null;
  }

  const existing = await getCachedUri(url);
  if (existing) {
    return existing;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }

  const download = (async () => {
    await ensureCacheDir();
    const path = getLocalPath(key);
    const tempPath = `${path}.tmp`;

    try {
      if (await RNFS.exists(tempPath)) {
        await RNFS.unlink(tempPath);
      }

      const { statusCode } = await RNFS.downloadFile({
        fromUrl: url,
        toFile: tempPath,
      }).promise;

      if (statusCode < 200 || statusCode >= 300) {
        await RNFS.unlink(tempPath).catch(() => {});
        return null;
      }

      if (await RNFS.exists(path)) {
        await RNFS.unlink(path).catch(() => {});
      }
      await RNFS.moveFile(tempPath, path);

      const uri = toFileUri(path);
      memoryCache.set(key, uri);
      return uri;
    } catch {
      await RNFS.unlink(tempPath).catch(() => {});
      return null;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, download);
  return download;
}

/**
 * Prefetch many images with bounded concurrency.
 * @param {string[]} urls
 * @param {{ concurrency?: number }} [options]
 * @returns {Promise<Array<string | null>>}
 */
export async function prefetchImages(urls, { concurrency = 6 } = {}) {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) {
    return [];
  }

  const results = new Array(unique.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < unique.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await prefetchImage(unique[index]);
    }
  }

  const poolSize = Math.min(Math.max(1, concurrency), unique.length);
  await Promise.all(Array.from({ length: poolSize }, () => worker()));
  return results;
}

/**
 * Return URLs that are not yet on disk / in memory.
 * @param {string[]} urls
 * @returns {Promise<string[]>}
 */
export async function filterUncachedUrls(urls) {
  const unique = [...new Set(urls.filter(Boolean))];
  const missing = [];

  for (const url of unique) {
    const cached = await getCachedUri(url);
    if (!cached) {
      missing.push(url);
    }
  }

  return missing;
}

/**
 * Best source for rendering: local cache when available, otherwise remote.
 * @param {string | null | undefined} url
 * @returns {{ uri: string } | null}
 */
export function resolveImageSource(url) {
  if (typeof url !== 'string' || !url) {
    return null;
  }
  const cached = getCachedUriSync(url);
  return { uri: cached || url };
}
