import { Platform } from 'react-native';

/** Shared native-stack transition. Not for bottom tabs (they use fade/shift/none). */
export const animation = Platform.OS === 'android' ? 'simple_push' : undefined;
