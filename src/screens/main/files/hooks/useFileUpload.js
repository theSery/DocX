import { useCallback, useState } from 'react';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import { filesApi } from '../../../../api';
import { showGlobalSheet } from '../../../../components/GlobalSheet';
import { useToast, useTheme } from '../../../../hooks';
import { runAfterSheetDismiss } from '../../../../utils/runAfterSheetDismiss';
import { FileUploadSheet } from '../components/FileUploadSheet';
import CameraSvg from '../../../../components/icons/CameraSvg';
import AttachSvg from '../../../../components/icons/AttachSvg';

const KB = 1024;
const MB = 1024 * KB;

/** Common production limits: reject empty/tiny files and oversized uploads. */
const IMAGE_MIN_BYTES = 1 * KB;
const IMAGE_MAX_BYTES = 10 * MB;
const FILE_MIN_BYTES = 1 * KB;
const FILE_MAX_BYTES = 25 * MB;

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
  if (typeof reportedSize === 'number' && Number.isFinite(reportedSize) && reportedSize >= 0) {
    return reportedSize;
  }

  try {
    const stat = await RNFS.stat(toFsPath(uri));
    const size = Number(stat.size);
    return Number.isFinite(size) ? size : null;
  } catch (error) {
    console.error('[useFileUpload] failed to resolve file size:', error);
    return null;
  }
}

function getSizeLimits(mimeType) {
  if (isImageMimeType(mimeType)) {
    return { minBytes: IMAGE_MIN_BYTES, maxBytes: IMAGE_MAX_BYTES };
  }

  return { minBytes: FILE_MIN_BYTES, maxBytes: FILE_MAX_BYTES };
}

export function useFileUpload({ onUploaded } = {}) {
  const { showToast } = useToast();
  const { colors } = useTheme();
  const [pendingFile, setPendingFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const closeUploadSheet = useCallback(() => {
    if (isUploading) {
      return;
    }

    setPendingFile(null);
  }, [isUploading]);

  const performUpload = useCallback(
    async (pickedFile, fileName) => {
      setIsUploading(true);

      try {
        await filesApi.uploadFile({
          fileName,
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.type,
        });
        showToast({
          title: 'Ֆայլը հաջողությամբ վերբեռնվեց',
          type: 'success',
        });
        setPendingFile(null);
        onUploaded?.();
      } catch (error) {
        console.error('[useFileUpload] upload failed:', error);
        const errorBody = Array.isArray(error?.message)
          ? error.message.join(', ')
          : error?.message ?? 'Անհայտ սխալ, փորձեք կրկին';
        showToast({
          title: 'Վերբեռնումը ձախողվեց',
          body: errorBody,
          type: 'error',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onUploaded, showToast],
  );

  const handleSubmitUpload = useCallback(
    fileName => {
      if (!pendingFile) {
        return;
      }

      performUpload(pendingFile, fileName);
    },
    [pendingFile, performUpload],
  );

  const handlePickedFile = useCallback(
    async pickedFile => {
      if (!pickedFile?.uri) {
        return;
      }

      const size = await resolveFileSize(pickedFile.uri, pickedFile.size);
      if (size == null) {
        showToast({
          title: 'Ֆայլի չափը հնարավոր չէ ստուգել',
          body: 'Փորձեք ընտրել այլ ֆայլ',
          type: 'error',
        });
        return;
      }

      const { minBytes, maxBytes } = getSizeLimits(pickedFile.type);

      if (size < minBytes) {
        showToast({
          title: 'Ֆայլը չափազանց փոքր է',
          body: `Նվազագույն չափը՝ ${formatSizeLimit(minBytes)}`,
          type: 'error',
        });
        return;
      }

      if (size > maxBytes) {
        showToast({
          title: 'Ֆայլը չափազանց մեծ է',
          body: `Առավելագույն չափը՝ ${formatSizeLimit(maxBytes)}`,
          type: 'error',
        });
        return;
      }

      setPendingFile({ ...pickedFile, size });
    },
    [showToast],
  );

  const openImageLibrary = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          console.error('[useFileUpload] gallery picker error:', response);
          showToast({
            title: 'Սխալ',
            body: response.errorMessage ?? response.errorCode,
            type: 'error',
          });
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          showToast({
            title: 'Նկար չի ընտրվել',
            type: 'error',
          });
          return;
        }

        handlePickedFile({
          uri: asset.uri,
          name: asset.fileName ?? `image-${Date.now()}.jpg`,
          type: asset.type ?? 'image/jpeg',
          size: asset.fileSize,
        });
      },
    );
  }, [handlePickedFile, showToast]);

  const pickFromGallery = useCallback(() => {
    runAfterSheetDismiss(openImageLibrary);
  }, [openImageLibrary]);

  const openDocumentPicker = useCallback(async () => {
    try {
      const [result] = await pick({
        type: [types.pdf, types.images],
        mode: 'import',
      });

      if (!result?.uri) {
        return;
      }

      await handlePickedFile({
        uri: result.uri,
        name: result.name ?? `document-${Date.now()}`,
        type: result.type ?? 'application/octet-stream',
        size: result.size,
      });
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }

      console.error('[useFileUpload] file picker error:', error);
      showToast({
        title: 'Ֆայլի ընտրությունը ձախողվեց',
        body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
        type: 'error',
      });
    }
  }, [handlePickedFile, showToast]);

  const pickFromFiles = useCallback(() => {
    runAfterSheetDismiss(() => {
      openDocumentPicker();
    });
  }, [openDocumentPicker]);

  const handleAddPress = useCallback(() => {
    showGlobalSheet({
      variant: 'menu',
      menuItems: [
        {
          label: 'Գալերեա',
          icon: <CameraSvg width={20} height={20} fill={colors.icons} />,
          onPress: pickFromGallery,
        },
        {
          label: 'Ֆայլեր',
          icon: <AttachSvg width={20} height={20} fill={colors.icons} />,
          onPress: pickFromFiles,
        },
      ],
    });
  }, [colors.icons, pickFromFiles, pickFromGallery]);

  const uploadSheet = (
    <FileUploadSheet
      visible={Boolean(pendingFile)}
      pickedFile={pendingFile}
      onClose={closeUploadSheet}
      onUpload={handleSubmitUpload}
      isUploading={isUploading}
    />
  );

  return { handleAddPress, uploadSheet };
}
