import { delay } from '../delay';
import { collectIconUrls } from './collectIconUrls';
import {
  filterUncachedUrls,
  prefetchImages,
} from './imageCache';

/** Max time to block first paint waiting for critical (home) icons. */
export const CRITICAL_ICON_PREFETCH_TIMEOUT_MS = 3500;

/**
 * Prefetch category icons before the first home screen, then warm the rest.
 *
 * Critical = top-level category icons shown on Home.
 * Secondary = subcategory + legal-issue icons used deeper in navigation.
 *
 * @param {unknown} categories
 * @param {{
 *   criticalTimeoutMs?: number;
 *   criticalConcurrency?: number;
 *   secondaryConcurrency?: number;
 * }} [options]
 * @returns {Promise<void>}
 */
export async function prefetchCategoryIcons(
  categories,
  {
    criticalTimeoutMs = CRITICAL_ICON_PREFETCH_TIMEOUT_MS,
    criticalConcurrency = 6,
    secondaryConcurrency = 4,
  } = {},
) {
  const criticalUrls = collectIconUrls(categories, { levels: ['category'] });
  const missingCritical = await filterUncachedUrls(criticalUrls);

  if (missingCritical.length > 0) {
    await Promise.race([
      prefetchImages(missingCritical, { concurrency: criticalConcurrency }),
      delay(criticalTimeoutMs),
    ]);
  }

  // Warm deeper icons after first paint is unblocked (fire-and-forget).
  const secondaryUrls = collectIconUrls(categories, {
    levels: ['subCategory', 'legalIssue'],
  });
  if (secondaryUrls.length > 0) {
    prefetchImages(secondaryUrls, { concurrency: secondaryConcurrency }).catch(
      () => {},
    );
  }
}
