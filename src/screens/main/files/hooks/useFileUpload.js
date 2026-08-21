import { useCallback, useState } from 'react';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { launchGallery } from '../../../../utils/launchGallery';

import { filesApi } from '../../../../api';
import { showGlobalSheet } from '../../../../components/GlobalSheet';
import { useToast, useTheme } from '../../../../hooks';
import { validatePickedUploadFile } from '../../../../utils/fileUploadValidation';
import { runAfterSheetDismiss } from '../../../../utils/runAfterSheetDismiss';
import { FileUploadSheet } from '../components/FileUploadSheet';
import CameraSvg from '../../../../components/icons/CameraSvg';
import AttachSvg from '../../../../components/icons/AttachSvg';

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
      const result = await validatePickedUploadFile(pickedFile);
      if (!result.ok) {
        showToast({
          title: result.title,
          body: result.body,
          type: 'error',
        });
        return;
      }

      setPendingFile(result.file);
    },
    [showToast],
  );

  const openImageLibrary = useCallback(() => {
    launchGallery(
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
