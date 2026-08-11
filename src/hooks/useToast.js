import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

export function useToast() {
  const showToast = useCallback(
    ({ title, body, type = 'info', onHide, visibilityTime = 4000 }) => {
      Toast.show({
        type,
        text1: title,
        text2: body,
        position: 'top',
        visibilityTime,
        ...(onHide ? { onHide } : {}),
      });
    },
    [],
  );

  return { showToast };
}
