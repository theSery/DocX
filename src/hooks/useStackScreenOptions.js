import { createStackScreenOptions } from '../theme/stackScreenOptions';
import { useThemedStyles } from './useThemedStyles';

export function useStackScreenOptions() {
  return useThemedStyles(createStackScreenOptions);
}
