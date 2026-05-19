import { createMainScreenStyles } from '../screens/main/mainScreenStyles';
import { useThemedStyles } from './useThemedStyles';

export function useMainScreenStyles() {
  return useThemedStyles(createMainScreenStyles);
}
