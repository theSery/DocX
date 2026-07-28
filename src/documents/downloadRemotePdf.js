import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const EXTENSION_MIME_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  bmp: 'image/bmp',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'heic',
  'bmp',
]);

function sanitizeFileName(name) {
  const trimmed = (name || 'document').trim().replace(/\.[a-z0-9]+$/i, '');

  return trimmed
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 120);
}

function getExtensionFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : null;
  } catch {
    const cleanPath = url.split('?')[0].split('#')[0];
    const match = cleanPath.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : null;
  }
}

function getExtensionFromFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return null;
  }

  const match = fileName.trim().match(/\.([a-z0-9]+)$/i);
  const extension = match ? match[1].toLowerCase() : null;

  return extension && EXTENSION_MIME_TYPES[extension] ? extension : null;
}

/**
 * Resolves extension/MIME from download URL first, then preview URL, then file name.
 *
 * @param {{ url?: string; previewUrl?: string; fileName?: string }} params
 */
export function resolveRemoteFileMeta({ url, previewUrl, fileName } = {}) {
  const extension =
    getExtensionFromUrl(url) ||
    getExtensionFromUrl(previewUrl) ||
    getExtensionFromFileName(fileName) ||
    'pdf';

  return {
    extension,
    mimeType: EXTENSION_MIME_TYPES[extension] ?? 'application/octet-stream',
    isImage: IMAGE_EXTENSIONS.has(extension),
  };
}

function toShareUrl(localPath) {
  if (Platform.OS === 'android' && !localPath.startsWith('file://')) {
    return `file://${localPath}`;
  }

  return localPath;
}

/**
 * iOS Files picker (`saveToFiles`) rejects with CANCELLED on dismiss,
 * and does not respect `failOnCancel: false`.
 *
 * @param {unknown} error
 */
export function isShareCancelled(error) {
  if (!error) {
    return false;
  }

  const code = String(error?.code ?? '');
  const message = String(error?.message ?? error ?? '');

  return (
    code === 'CANCELLED' ||
    message === 'CANCELLED' ||
    message.includes('CANCELLED') ||
    message.includes('PICKER_WAS_CANCELLED') ||
    message.includes('User did not share')
  );
}

async function openShareSheet(shareOptions) {
  try {
    return await Share.open(shareOptions);
  } catch (error) {
    if (isShareCancelled(error)) {
      return { dismissedAction: true, success: false };
    }

    throw error;
  }
}

/**
 * Downloads a remote file and opens the system share sheet so the user can save it.
 * Uses `url` (downloadUrl) for the download bytes and `previewUrl` (documentUrl)
 * as a fallback when detecting image vs PDF/DOCX from the path.
 *
 * @param {{ url: string; previewUrl?: string; fileName?: string }} params
 */
export async function downloadAndShareRemoteFile({
  url,
  previewUrl,
  fileName,
}) {
  if (!url) {
    throw new Error('Ներբեռնման հղում չի գտնվել');
  }

  const { extension, mimeType, isImage } = resolveRemoteFileMeta({
    url,
    previewUrl,
    fileName,
  });

  const localFileName = `${sanitizeFileName(fileName)}.${extension}`;
  const localPath = `${RNFS.DocumentDirectoryPath}/${localFileName}`;

  if (await RNFS.exists(localPath)) {
    await RNFS.unlink(localPath);
  }

  const { statusCode } = await RNFS.downloadFile({
    fromUrl: url,
    toFile: localPath,
  }).promise;

  if (statusCode !== 200) {
    throw new Error(
      isImage
        ? 'Չհաջողվեց ներբեռնել նկարը'
        : 'Չհաջողվեց ներբեռնել ֆայլը',
    );
  }

  const shareOptions = {
    url: toShareUrl(localPath),
    type: mimeType,
    filename: localFileName,
    failOnCancel: false,
    showAppsToView: true,
  };

  // Images: open Files directly so the saved file opens with the correct type.
  if (Platform.OS === 'ios' && isImage) {
    shareOptions.saveToFiles = true;
  }

  const shareResult = await openShareSheet(shareOptions);

  return {
    localPath,
    mimeType,
    isImage,
    extension,
    dismissed: Boolean(shareResult?.dismissedAction),
  };
}

/**
 * Downloads a remote PDF and opens the system share sheet so the user can save it.
 *
 * @param {{ url: string; fileName?: string }} params
 */
export async function downloadAndShareRemotePdf({ url, fileName }) {
  return downloadAndShareRemoteFile({
    url,
    fileName,
  });
}
