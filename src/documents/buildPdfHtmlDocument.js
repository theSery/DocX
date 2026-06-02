import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export const PDF_PAGE_WIDTH_PT = 595;
const A4_HEIGHT_PT = 842;

export function getPdfWebViewBaseUrl() {
  if (Platform.OS === 'ios') {
    return `file://${RNFS.MainBundlePath}/`;
  }
  return 'file:///android_asset/fonts/';
}

function getPdfBaseUrl() {
  return getPdfWebViewBaseUrl();
}

function getDocumentStyles() {
  const regularFont =
    Platform.OS === 'ios' ? 'Montserratarm-Regular.otf' : 'Montserratarm-Regular.otf';
  const boldFont =
    Platform.OS === 'ios' ? 'Montserratarm-Bold.otf' : 'Montserratarm-Bold.otf';

  return `
    @page { margin: 36pt 40pt; }
    @font-face {
      font-family: 'Montserratarm';
      src: url('${regularFont}');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Montserratarm';
      src: url('${boldFont}');
      font-weight: 700;
      font-style: normal;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      color: #111;
      font-family: 'Montserratarm', sans-serif;
      font-size: 11pt;
      line-height: 1.45;
    }
    .doc { width: 100%; }
    .reference {
      margin: 0 0 8pt;
      font-size: 10pt;
    }
    .site-line {
      margin: 0 0 20pt;
      font-size: 10pt;
      color: #333;
    }
    .party-block {
      text-align: right;
      margin: 0 0 24pt;
      font-size: 10.5pt;
      line-height: 1.5;
    }
    .party-block p { margin: 0 0 4pt; }
    h1 {
      margin: 0 0 8pt;
      text-align: center;
      font-size: 14pt;
      font-weight: 700;
      line-height: 1.3;
    }
    .doc-subtitle {
      margin: 0 0 24pt;
      text-align: center;
      font-size: 11pt;
    }
    .section { margin: 0 0 16pt; }
    .section-heading {
      margin: 0 0 8pt;
      font-weight: 700;
    }
    .section p { margin: 0 0 8pt; text-align: justify; }
    strong { font-weight: 700; }
  `;
}

/**
 * Wraps a backend HTML fragment in a full document with PDF-friendly styles.
 * @param {string} bodyHtml
 */
export function buildPdfHtmlDocument(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="hy">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${getDocumentStyles()}</style>
  </head>
  <body>${bodyHtml}</body>
</html>`;
}

/** Viewport + layout so in-app WebView preview matches PDF page scale (not device-width text). */
export function getPdfPreviewViewportMeta() {
  return `<meta name="viewport" content="width=${PDF_PAGE_WIDTH_PT}, initial-scale=1, maximum-scale=1, user-scalable=no" />`;
}

export function getPdfPreviewPageStyles() {
  return `
    html {
      -webkit-text-size-adjust: 100%;
      background: #fff;
    }
    body {
      width: ${PDF_PAGE_WIDTH_PT}pt;
      max-width: ${PDF_PAGE_WIDTH_PT}pt;
      margin: 0 auto;
      padding: 36pt 40pt;
      box-sizing: border-box;
    }
  `;
}

export function getPdfGenerationDefaults() {
  return {
    width: PDF_PAGE_WIDTH_PT,
    height: A4_HEIGHT_PT,
    baseURL: getPdfBaseUrl(),
    shouldPrintBackgrounds: true,
    padding: 24,
    bgColor: '#FFFFFF',
  };
}
