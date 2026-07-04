import { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';

import { personalDocumentsApi } from '../../../../api';
import { showGlobalSheet } from '../../../../components/GlobalSheet';
import { downloadAndShareRemotePdf } from '../../../../documents';
import { useToast } from '../../../../hooks';
import { getUploadPreviewContent } from '../utils/personalDocumentFilePicker';

const SHEET_DISMISS_DELAY_MS = 350;

function runAfterSheetDismiss(callback) {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(callback, SHEET_DISMISS_DELAY_MS);
  });
}

export function usePersonalDocumentCard({ document, onDeleted, onUploaded }) {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hasDocument = Boolean(document.documentUrl);
  const hasFile = Boolean(document.downloadUrl);
  const statusLabel = hasDocument ? 'Կցված' : 'Բացակայում է';
  const statusColorKey = hasDocument ? 'success' : 'error';

  const handleDownload = useCallback(async () => {
    if (!document.downloadUrl) {
      return;
    }

    try {
      await downloadAndShareRemotePdf({
        url: document.downloadUrl,
        fileName: document.title,
      });
    } catch (error) {
      console.error('[PersonalDocumentCard] download failed:', error);
      showToast({
        title: 'Ներբեռնումը ձախողվեց',
        body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
        type: 'error',
      });
    }
  }, [document.downloadUrl, document.title, showToast]);

  const performUpload = useCallback(
    async pickedFile => {
      try {
        const response = await personalDocumentsApi.uploadPersonalDocument({
          documentName: document.title,
          attachedDocumentId: document.attachedDocumentId,
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.type,
        });
        console.log('[PersonalDocumentCard] upload response:', response);
        showToast({
          title: 'Փաստաթուղթը հաջողությամբ վերբեռնվեց',
          type: 'success',
        });
        onUploaded?.(document.id);
      } catch (error) {
        console.error('[PersonalDocumentCard] upload failed:', error);
        const errorBody = Array.isArray(error?.message)
          ? error.message.join(', ')
          : error?.message ?? 'Անհայտ սխալ, փորձեք կրկին';
        showToast({
          title: 'Վերբեռնումը ձախողվեց',
          body: errorBody,
          type: 'error',
        });
      }
    },
    [
      document.attachedDocumentId,
      document.id,
      document.title,
      onUploaded,
      showToast,
    ],
  );

  const showUploadPreviewSheet = useCallback(
    pickedFile => {
      showGlobalSheet({
        message: document.title,
        description: pickedFile.name,
        content: getUploadPreviewContent(pickedFile),
        actions: [
          { label: 'Վերբեռնել', onPress: () => performUpload(pickedFile) },
          { label: 'Չեղարկել' },
        ],
      });
    },
    [document.title, performUpload],
  );

  const handlePickedFile = useCallback(
    pickedFile => {
      if (!pickedFile?.uri) {
        return;
      }

      showUploadPreviewSheet(pickedFile);
    },
    [showUploadPreviewSheet],
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
          console.error('[PersonalDocumentCard] gallery picker error:', response);
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

      handlePickedFile({
        uri: result.uri,
        name: result.name ?? `document-${Date.now()}`,
        type: result.type ?? 'application/octet-stream',
      });
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }

      console.error('[PersonalDocumentCard] file picker error:', error);
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

  const handleDelete = useCallback(async () => {
    try {
      const response = await personalDocumentsApi.deletePersonalDocument(
        document.id,
      );
      console.log('[PersonalDocumentCard] delete response:', response);
      onDeleted?.(document.id);
      showToast({
        title: 'Փաստաթուղթը հաջողությամբ ջնջվեց',
        type: 'success',
      });
    } catch (error) {
      console.error('[PersonalDocumentCard] delete failed:', error);
      showToast({
        title: 'Ջնջելը ձախողվեց',
        body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
        type: 'error',
      });
    }
  }, [document.id, onDeleted, showToast]);

  const showDeleteConfirmation = useCallback(() => {
    showGlobalSheet({
      message: 'Դուք համոզված եք, որ ցանկանում եք ջնջել',
      description: document.title,
      actions: [
        { label: 'Ջնջել', destructive: true, onPress: handleDelete },
        { label: 'Չեղարկել' },
      ],
    });
  }, [document.title, handleDelete]);

  const handleViewFile = useCallback(() => {
    navigation.navigate('PersonalDocumentView', {
      id: document.id,
      title: document.title,
      documentUrl: document.documentUrl,
      downloadUrl: document.downloadUrl,
    });
  }, [
    document.documentUrl,
    document.downloadUrl,
    document.id,
    document.title,
    navigation,
  ]);

  return {
    isMenuOpen,
    setIsMenuOpen,
    hasDocument,
    hasFile,
    statusLabel,
    statusColorKey,
    handleDownload,
    pickFromGallery,
    pickFromFiles,
    handleDelete,
    showDeleteConfirmation,
    handleViewFile,
  };
}
