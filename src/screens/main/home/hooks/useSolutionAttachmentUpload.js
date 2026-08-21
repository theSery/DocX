import { useCallback, useState } from 'react';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { launchGallery } from '../../../../utils/launchGallery';
import RNFS from 'react-native-fs';

import { filesApi, personalDocumentsApi } from '../../../../api';
import { resolveRemoteFileMeta } from '../../../../documents';
import { useToast } from '../../../../hooks';
import { useAppDispatch } from '../../../../store';
import {
  fetchPersonalDocuments,
  removePersonalDocument,
} from '../../../../store/slices/personalDocumentsSlice';
import { validatePickedUploadFile } from '../../../../utils/fileUploadValidation';

function toUploadTarget(row) {
  const attachedDocument = row?.attachedDocument;
  return {
    documentName: attachedDocument?.name ?? row?.name,
    attachedDocumentId: attachedDocument?.id ?? row?.attachedDocumentId,
    // Default personal-document slots accept POST /personal-documents.
    usePersonalDocumentSlot: Boolean(row.isDefault),
    // When replacing a non-default upload, delete this id after the new file succeeds.
    replacePersonalDocumentId: row?.replacePersonalDocumentId ?? null,
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

function toFileUri(localPath) {
  if (!localPath) {
    return localPath;
  }

  return localPath.startsWith('file://') ? localPath : `file://${localPath}`;
}

async function downloadPersonalDocumentAsPickedFile(personalDocument) {
  const url = personalDocument?.downloadUrl || personalDocument?.documentUrl;
  if (!url) {
    throw new Error('Ֆայլի հղում չի գտնվել');
  }

  const { extension, mimeType } = resolveRemoteFileMeta({
    url: personalDocument?.downloadUrl,
    previewUrl: personalDocument?.documentUrl,
    fileName:
      personalDocument?.documentName || personalDocument?.title || undefined,
  });

  const localFileName = `solution-attach-${Date.now()}.${extension}`;
  const localPath = `${RNFS.CachesDirectoryPath}/${localFileName}`;

  if (await RNFS.exists(localPath)) {
    await RNFS.unlink(localPath);
  }

  const { statusCode } = await RNFS.downloadFile({
    fromUrl: url,
    toFile: localPath,
  }).promise;

  if (statusCode !== 200) {
    throw new Error('Չհաջողվեց ներբեռնել ֆայլը');
  }

  return {
    uri: toFileUri(localPath),
    name: localFileName,
    type: mimeType,
    localPath,
  };
}

/**
 * Gallery / Files / My Files pickers + upload for solution attachments.
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
      if (
        attachment?.attachedDocumentId == null ||
        !attachment?.documentName
      ) {
        showToast({
          title: 'Փաստաթղթի տվյալները բացակայում են',
          type: 'error',
        });
        return;
      }

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

        const responseFileId = extractUploadedFileId(response, {
          fromFilesApi,
        });
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
        if (replaceId != null && String(replaceId) !== String(fileId)) {
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
        if (pickedFile?.localPath) {
          RNFS.unlink(pickedFile.localPath).catch(() => {});
        }
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

      await performUpload(attachment, result.file);
    },
    [performUpload, showToast],
  );

  const pickFromGallery = useCallback(
    row => {
      const attachment = toUploadTarget(row);

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

  const pickFromMyFiles = useCallback(
    async (row, personalDocument) => {
      const attachment = toUploadTarget(row);

      if (
        attachment.attachedDocumentId == null ||
        !attachment.documentName
      ) {
        showToast({
          title: 'Փաստաթղթի տվյալները բացակայում են',
          type: 'error',
        });
        return;
      }

      const alreadyMatchesSlot =
        personalDocument?.attachedDocumentId != null &&
        String(personalDocument.attachedDocumentId) ===
          String(attachment.attachedDocumentId) &&
        Boolean(
          personalDocument?.documentUrl || personalDocument?.downloadUrl,
        );

      if (alreadyMatchesSlot) {
        onUploaded?.(attachment.attachedDocumentId);
        return;
      }

      setIsUploading(true);
      try {
        const pickedFile =
          await downloadPersonalDocumentAsPickedFile(personalDocument);
        await handlePickedFile(attachment, pickedFile);
      } catch (error) {
        console.error(
          '[SolutionAttachmentUpload] my-files copy failed:',
          error,
        );
        showToast({
          title: 'Վերբեռնումը ձախողվեց',
          body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
          type: 'error',
        });
        setIsUploading(false);
      }
    },
    [handlePickedFile, onUploaded, showToast],
  );

  return { pickFromGallery, pickFromFiles, pickFromMyFiles, isUploading };
}
