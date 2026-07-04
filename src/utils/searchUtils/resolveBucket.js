import { SHRINK_THRESHOLD } from './constants';

export function resolveBucket(length) {
  if (length === 0) {
    return 'closed';
  }
  if (length >= SHRINK_THRESHOLD) {
    return 'shrunk';
  }
  return 'expanded';
}
