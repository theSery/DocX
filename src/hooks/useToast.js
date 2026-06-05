import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

export function useToast() {
  const showToast = useCallback(({ title, body, type = 'info' }) => {
    Toast.show({
      type,
      text1: title,
      text2: body,
      position: 'top',
      visibilityTime: 4000,
    });
  }, []);

  return { showToast };
}
