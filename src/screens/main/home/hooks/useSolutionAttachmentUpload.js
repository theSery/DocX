import { useCallback, useState } from 'react';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';

import { filesApi, personalDocumentsApi } from '../../../../api';
import { useToast } from '../../../../hooks';
import { useAppDispatch } from '../../../../store';
import {
  fetchPersonalDocuments,
  removePersonalDocument,
} from '../../../../store/slices/personalDocumentsSlice';
import { validatePickedUploadFile } from '../../../../utils/fileUploadValidation';

function toUploadTarget(row) {
  return {
    documentName: row.name,
    attachedDocumentId: row.attachedDocumentId,
    // Default personal-document slots accept POST /personal-documents.
    usePersonalDocumentSlot: Boolean(row.isDefault),
    // When replacing a non-default upload, delete this id after the new file succeeds.
    replacePersonalDocumentId: row.replacePersonalDocumentId ?? null,
  };
}

function extractUploadedFileId(response, { fromFilesApi = false } = {}) {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (payload == null || typeof payload !== 'object') {
    return null;
  }

  const candidates = fromFilesApi
    ? [payload.fileId, payload.file?.id, payload.id]
    : [payload.fileId, payload.file?.id];

  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

/**
 * Gallery / Files pickers + upload for solution attachments.
 * Picks open from the attachments sheet row; uploads immediately after selection.
 * - Default personal-doc slots → POST /personal-documents
 * - Everything else → POST /files (fileName = attachedDocument.name)
 */
export function useSolutionAttachmentUpload({ onUploaded } = {}) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const refreshPersonalDocuments = useCallback(() => {
    return dispatch(fetchPersonalDocuments({ page: 1, limit: 100 }));
  }, [dispatch]);

  const resolveFileIdAfterRefresh = useCallback(
    async (attachment, responseFileId) => {
      if (Number.isFinite(Number(responseFileId))) {
        return Number(responseFileId);
      }

      const action = await refreshPersonalDocuments();
      const items = action.payload?.items ?? [];
      const matched =
        items.find(
          item =>
            String(item.attachedDocumentId) ===
            String(attachment.attachedDocumentId),
        ) ??
        items.find(item => item.documentName === attachment.documentName) ??
        null;

      const value = Number(matched?.fileId);
      return Number.isFinite(value) ? value : null;
    },
    [refreshPersonalDocuments],
  );

  const performUpload = useCallback(
    async (attachment, pickedFile) => {
      setIsUploading(true);
      try {
        let response;
        let fromFilesApi = false;

        if (attachment.usePersonalDocumentSlot) {
          response = await personalDocumentsApi.uploadPersonalDocument({
            documentName: attachment.documentName,
            attachedDocumentId: attachment.attachedDocumentId,
            uri: pickedFile.uri,
            name: pickedFile.name,
            type: pickedFile.type,
          });
        } else {
          fromFilesApi = true;
          response = await filesApi.uploadFile({
            fileName: attachment.documentName,
            uri: pickedFile.uri,
            name: pickedFile.name,
            type: pickedFile.type,
          });
        }

        const responseFileId = extractUploadedFileId(response, { fromFilesApi });
        const fileId = await resolveFileIdAfterRefresh(
          attachment,
          responseFileId,
        );

        if (!Number.isFinite(fileId)) {
          throw new Error('Ֆայլի ID չի գտնվել վերբեռնումից հետո');
        }

        // Replace flow: drop the previous non-default personal document so the
        // store keeps a single version for this attachment slot.
        const replaceId = attachment.replacePersonalDocumentId;
        if (
          replaceId != null &&
          String(replaceId) !== String(fileId)
        ) {
          try {
            await personalDocumentsApi.deletePersonalDocument(replaceId);
            dispatch(removePersonalDocument(replaceId));
          } catch (deleteError) {
            console.error(
              '[SolutionAttachmentUpload] failed to delete replaced document',
              deleteError,
            );
          }
        }

        showToast({
          title: 'Փաստաթուղթը հաջողությամբ վերբեռնվեց',
          type: 'success',
        });

        await refreshPersonalDocuments();
        onUploaded?.(attachment.attachedDocumentId, fileId);
      } catch (error) {
        console.error('[SolutionAttachmentUpload] upload failed:', error);
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
    [
      dispatch,
      onUploaded,
      refreshPersonalDocuments,
      resolveFileIdAfterRefresh,
      showToast,
    ],
  );

  const handlePickedFile = useCallback(
    async (attachment, pickedFile) => {
      const result = await validatePickedUploadFile(pickedFile);
      if (!result.ok) {
        showToast({
          title: result.title,
          body: result.body,
          type: 'error',
        });
        return;
      }

      performUpload(attachment, result.file);
    },
    [performUpload, showToast],
  );

  const pickFromGallery = useCallback(
    row => {
      const attachment = toUploadTarget(row);

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

          handlePickedFile(attachment, {
            uri: asset.uri,
            name: asset.fileName ?? `image-${Date.now()}.jpg`,
            type: asset.type ?? 'image/jpeg',
            size: asset.fileSize,
          });
        },
      );
    },
    [handlePickedFile, showToast],
  );

  const pickFromFiles = useCallback(
    async row => {
      const attachment = toUploadTarget(row);

      try {
        const [result] = await pick({
          type: [types.pdf, types.images],
          mode: 'import',
        });

        if (!result?.uri) {
          return;
        }

        await handlePickedFile(attachment, {
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

        showToast({
          title: 'Ֆայլի ընտրությունը ձախողվեց',
          body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
          type: 'error',
        });
      }
    },
    [handlePickedFile, showToast],
  );

  return { pickFromGallery, pickFromFiles, isUploading };
}
