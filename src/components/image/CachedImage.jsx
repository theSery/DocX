import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import {
  getCachedUri,
  getCachedUriSync,
  prefetchImage,
  resolveImageSource,
} from '../../utils/imageCache';

/**
 * Resolve a remote icon URI to a cached local file when available.
 * Prefetches into disk cache on miss so later mounts are instant.
 *
 * @param {string | null | undefined} uri
 * @returns {{ uri: string } | null}
 */
export function useCachedImageSource(uri) {
  const [source, setSource] = useState(() => resolveImageSource(uri));

  useEffect(() => {
    let cancelled = false;

    if (typeof uri !== 'string' || !uri) {
      setSource(null);
      return undefined;
    }

    const sync = getCachedUriSync(uri);
    if (sync) {
      setSource({ uri: sync });
      return undefined;
    }

    setSource({ uri });

    (async () => {
      const cached = await getCachedUri(uri);
      if (cancelled) {
        return;
      }
      if (cached) {
        setSource({ uri: cached });
        return;
      }

      const downloaded = await prefetchImage(uri);
      if (!cancelled && downloaded) {
        setSource({ uri: downloaded });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uri]);

  return source;
}

/**
 * Drop-in Image that prefers the on-disk icon cache (survives signed URL rotation).
 */
export function CachedImage({ source, ...rest }) {
  const remoteUri =
    source && typeof source === 'object' && !Array.isArray(source)
      ? source.uri
      : null;
  const cachedSource = useCachedImageSource(remoteUri);

  if (remoteUri) {
    return <Image {...rest} source={cachedSource} />;
  }

  return <Image {...rest} source={source} />;
}
