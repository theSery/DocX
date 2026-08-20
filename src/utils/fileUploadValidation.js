import RNFS from 'react-native-fs';

const KB = 1024;
const MB = 1024 * KB;

/** Common production limits: reject empty/tiny files and oversized uploads. */
export const UPLOAD_SIZE_LIMITS = {
  IMAGE_MIN_BYTES: 1 * KB,
  IMAGE_MAX_BYTES: 10 * MB,
  FILE_MIN_BYTES: 1 * KB,
  FILE_MAX_BYTES: 25 * MB,
};

function isImageMimeType(mimeType) {
  return typeof mimeType === 'string' && mimeType.startsWith('image/');
}

function formatSizeLimit(bytes) {
  if (bytes >= MB) {
    return `${Math.round(bytes / MB)} ՄԲ`;
  }

  return `${Math.round(bytes / KB)} ԿԲ`;
}

function toFsPath(uri) {
  if (typeof uri !== 'string') {
    return uri;
  }

  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
}

async function resolveFileSize(uri, reportedSize) {
  if (
    typeof reportedSize === 'number' &&
    Number.isFinite(reportedSize) &&
    reportedSize >= 0
  ) {
    return reportedSize;
  }

  try {
    const stat = await RNFS.stat(toFsPath(uri));
    const size = Number(stat.size);
    return Number.isFinite(size) ? size : null;
  } catch (error) {
    console.error('[fileUploadValidation] failed to resolve file size:', error);
    return null;
  }
}

export function getUploadSizeLimits(mimeType) {
  if (isImageMimeType(mimeType)) {
    return {
      minBytes: UPLOAD_SIZE_LIMITS.IMAGE_MIN_BYTES,
      maxBytes: UPLOAD_SIZE_LIMITS.IMAGE_MAX_BYTES,
    };
  }

  return {
    minBytes: UPLOAD_SIZE_LIMITS.FILE_MIN_BYTES,
    maxBytes: UPLOAD_SIZE_LIMITS.FILE_MAX_BYTES,
  };
}

/**
 * Validates a user-picked file/image before upload.
 * @returns {{ ok: true, file: object } | { ok: false, title: string, body?: string }}
 */
export async function validatePickedUploadFile(pickedFile) {
  if (!pickedFile?.uri) {
    return {
      ok: false,
      title: 'Ֆայլ չի ընտրվել',
    };
  }

  const size = await resolveFileSize(pickedFile.uri, pickedFile.size);
  if (size == null) {
    return {
      ok: false,
      title: 'Ֆայլի չափը հնարավոր չէ ստուգել',
      body: 'Փորձեք ընտրել այլ ֆայլ',
    };
  }

  const { minBytes, maxBytes } = getUploadSizeLimits(pickedFile.type);

  if (size < minBytes) {
    return {
      ok: false,
      title: 'Ֆայլը չափազանց փոքր է',
      body: `Նվազագույն չափը՝ ${formatSizeLimit(minBytes)}`,
    };
  }

  if (size > maxBytes) {
    return {
      ok: false,
      title: 'Ֆայլը չափազանց մեծ է',
      body: `Առավելագույն չափը՝ ${formatSizeLimit(maxBytes)}`,
    };
  }

  return {
    ok: true,
    file: { ...pickedFile, size },
  };
}
