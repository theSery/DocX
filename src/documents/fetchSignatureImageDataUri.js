import RNFS from 'react-native-fs';
import { signatureApi } from '../api';
import { getAccessToken } from '../api/tokenStorage';

/**
 * Fetches the user's saved signature and returns a PNG data URI for PDF/WebView use.
 *
 * @returns {Promise<string>}
 */
export async function fetchSignatureImageDataUri() {
  const response = await signatureApi.getSignature();
  const fileUrl = response?.data?.fileUrl;

  if (!fileUrl) {
    throw new Error('Ստորագրություն չի գտնվել։');
  }

  const localPath = `${RNFS.CachesDirectoryPath}/doc-signature-${Date.now()}.png`;
  const token = await getAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const { statusCode } = await RNFS.downloadFile({
    fromUrl: fileUrl,
    toFile: localPath,
    headers,
  }).promise;

  if (statusCode !== 200) {
    throw new Error('Unable to load the signature image.');
  }

  const base64 = await RNFS.readFile(localPath, 'base64');
  return `data:image/png;base64,${base64}`;
}
