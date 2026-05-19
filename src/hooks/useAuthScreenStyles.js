import { createAuthScreenStyles } from '../screens/authScreens/authScreenStyles';
import { useThemedStyles } from './useThemedStyles';

export function useAuthScreenStyles() {
  return useThemedStyles(createAuthScreenStyles);
}
