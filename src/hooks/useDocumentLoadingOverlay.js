import { useEffect, useState } from 'react';

export const POST_LOAD_OVERLAY_DURATION = 1000;

export function useDocumentLoadingOverlay(isLoading) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(false);
    }, POST_LOAD_OVERLAY_DURATION);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return visible;
}
