import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';

function isPhotoPickerUnavailable(response) {
  const message = response?.errorMessage ?? '';
  return (
    response?.errorCode === 'others' &&
    (message.includes('PICK_IMAGES') ||
      message.includes('No Activity found to handle Intent'))
  );
}

function toPickerAssets(files) {
  return files
    .filter(file => file?.uri)
    .map(file => ({
      uri: file.uri,
      fileName: file.name,
      type: file.type,
      fileSize: file.size,
    }));
}

/**
 * Opens the system gallery. On Android devices without Photo Picker
 * (common below API 33 / without Play Services), falls back to the document picker.
 */
export function launchGallery(options, callback) {
  launchImageLibrary(options, async response => {
    if (!isPhotoPickerUnavailable(response)) {
      callback(response);
      return;
    }

    try {
      const selectionLimit = options?.selectionLimit ?? 1;
      const results = await pick({
        type: [types.images],
        mode: 'import',
        allowMultiSelection: selectionLimit !== 1,
      });

      const picked =
        selectionLimit === 1 ? results.slice(0, 1) : results.slice(0, selectionLimit);
      const assets = toPickerAssets(picked);

      if (!assets.length) {
        callback({ didCancel: true });
        return;
      }

      callback({ assets });
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        callback({ didCancel: true });
        return;
      }

      callback({
        errorCode: 'others',
        errorMessage: error?.message ?? response.errorMessage,
      });
    }
  });
}
