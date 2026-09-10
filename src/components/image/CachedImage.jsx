import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  getCachedSvgXmlSync,
  getCachedUri,
  getCachedUriSync,
  isSvgUrl,
  loadSvgXml,
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
 * @param {string | null | undefined} uri
 * @returns {string | null}
 */
function useCachedSvgXml(uri) {
  const [xml, setXml] = useState(() => getCachedSvgXmlSync(uri));

  useEffect(() => {
    let cancelled = false;

    if (!isSvgUrl(uri)) {
      setXml(null);
      return undefined;
    }

    const sync = getCachedSvgXmlSync(uri);
    if (sync) {
      setXml(sync);
      return undefined;
    }

    (async () => {
      const loaded = await loadSvgXml(uri);
      if (!cancelled) {
        setXml(loaded);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uri]);

  return xml;
}

function getSvgLayout(style) {
  const flat = StyleSheet.flatten(style) || {};
  const width = flat.width ?? '100%';
  const height = flat.height ?? '100%';
  const viewStyle = { ...flat, width, height };
  delete viewStyle.resizeMode;
  delete viewStyle.tintColor;
  delete viewStyle.overlayColor;
  return { width, height, viewStyle };
}

function CachedSvg({ uri, style }) {
  const xml = useCachedSvgXml(uri);
  const { width, height, viewStyle } = getSvgLayout(style);

  if (!xml) {
    return <View style={viewStyle} />;
  }

  return (
    <View style={viewStyle}>
      <SvgXml xml={xml} width={width} height={height} />
    </View>
  );
}

function CachedRasterImage({ remoteUri, style, ...rest }) {
  const cachedSource = useCachedImageSource(remoteUri);
  return <Image {...rest} source={cachedSource} style={style} />;
}

/**
 * Drop-in Image that prefers the on-disk icon cache (survives signed URL rotation).
 * Raster formats (png/jpg/webp) use Image; SVG uses react-native-svg.
 */
export function CachedImage({ source, style, ...rest }) {
  const remoteUri =
    source && typeof source === 'object' && !Array.isArray(source)
      ? source.uri
      : null;

  if (remoteUri && isSvgUrl(remoteUri)) {
    return <CachedSvg uri={remoteUri} style={style} />;
  }

  if (remoteUri) {
    return (
      <CachedRasterImage {...rest} remoteUri={remoteUri} style={style} />
    );
  }

  return <Image {...rest} source={source} style={style} />;
}
