import { createGlobalStyles } from '../theme/globalStyles';
import { useThemedStyles } from './useThemedStyles';

export function useGlobalStyles() {
  return useThemedStyles(createGlobalStyles);
}
