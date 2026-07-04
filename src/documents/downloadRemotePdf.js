import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

function sanitizeFileName(name) {
  const trimmed = (name || 'document').trim().replace(/\.pdf$/i, '');

  return trimmed.replace(/[<>:"/\\|?*]+/g, '_').replace(/\s+/g, '_').slice(0, 120);
}

/**
 * Downloads a remote PDF and opens the system share sheet so the user can save it.
 *
 * @param {{ url: string; fileName?: string }} params
 */
export async function downloadAndShareRemotePdf({ url, fileName }) {
  if (!url) {
    throw new Error('Ներբեռնման հղում չի գտնվել');
  }

  const localPath = `${RNFS.CachesDirectoryPath}/${sanitizeFileName(fileName)}.pdf`;

  const { statusCode } = await RNFS.downloadFile({
    fromUrl: url,
    toFile: localPath,
  }).promise;

  if (statusCode !== 200) {
    throw new Error('Չհաջողվեց ներբեռնել PDF-ը');
  }

  const shareUrl =
    Platform.OS === 'android' && !localPath.startsWith('file://')
      ? `file://${localPath}`
      : localPath;

  await Share.open({
    url: shareUrl,
    type: 'application/pdf',
    failOnCancel: false,
    showAppsToView: true,
  });
}
