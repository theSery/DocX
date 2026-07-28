import { useCallback, useRef, useState } from 'react';

import {
  downloadAndShareRemoteFile,
  generateAndShareDocumentPdf,
  isShareCancelled,
} from '../documents';
import { useToast } from './useToast';

const DEFAULT_ERROR_TITLE = 'Ներբեռնումը ձախողվեց';
const DEFAULT_ERROR_BODY = 'Անհայտ սխալ, փորձեք կրկին';

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error?.message === 'string' && error.message) {
    return error.message;
  }

  return DEFAULT_ERROR_BODY;
}

/**
 * Shared download/share orchestration for remote files and generated PDFs.
 * Keeps loading state and error handling consistent across the app.
 *
 * @param {{
 *   errorTitle?: string;
 *   onError?: (error: unknown) => void;
 *   onSuccess?: (result: unknown) => void;
 * }} [options]
 */
export function useFileDownload(options = {}) {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloadingRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const reportError = useCallback(
    error => {
      // Closing the Files / share sheet is not a failed download.
      if (isShareCancelled(error)) {
        return;
      }

      const { errorTitle = DEFAULT_ERROR_TITLE, onError } = optionsRef.current;

      console.error('[useFileDownload]', error);

      if (onError) {
        onError(error);
        return;
      }

      showToast({
        title: errorTitle,
        body: getErrorMessage(error),
        type: 'error',
      });
    },
    [showToast],
  );

  const runDownload = useCallback(
    async task => {
      if (isDownloadingRef.current) {
        return null;
      }

      isDownloadingRef.current = true;
      setIsDownloading(true);

      try {
        const result = await task();

        if (!result?.dismissed) {
          optionsRef.current.onSuccess?.(result);
        }

        return result;
      } catch (error) {
        if (!isShareCancelled(error)) {
          reportError(error);
        }
        return null;
      } finally {
        isDownloadingRef.current = false;
        setIsDownloading(false);
      }
    },
    [reportError],
  );

  /**
   * Downloads a remote attachment via `url` (downloadUrl).
   * Uses `previewUrl` (documentUrl) as a fallback for file-type detection.
   *
   * @param {{
   *   url?: string | null;
   *   previewUrl?: string | null;
   *   fileName?: string;
   * }} params
   */
  const downloadRemoteFile = useCallback(
    async ({ url, previewUrl, fileName } = {}) => {
      if (!url) {
        return null;
      }

      return runDownload(() =>
        downloadAndShareRemoteFile({
          url,
          previewUrl: previewUrl || undefined,
          fileName,
        }),
      );
    },
    [runDownload],
  );

  /**
   * Generates a PDF from HTML and opens the system share sheet.
   *
   * @param {{ documentHtml: string; fileName?: string }} params
   */
  const shareGeneratedPdf = useCallback(
    async ({ documentHtml, fileName } = {}) => {
      if (!documentHtml) {
        return null;
      }

      return runDownload(() =>
        generateAndShareDocumentPdf({
          documentHtml,
          fileName,
        }),
      );
    },
    [runDownload],
  );

  return {
    isDownloading,
    downloadRemoteFile,
    shareGeneratedPdf,
  };
}
