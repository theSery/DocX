import { DOCUMENT_TYPING_ANIMATION_SCRIPT } from './documentTypingAnimationScript';

const BODY_CLOSE = '</body>';

/**
 * @param {string} fullDocumentHtml
 */
export function buildTypingPreviewHtml(fullDocumentHtml) {
  const scriptTag = `<script>${DOCUMENT_TYPING_ANIMATION_SCRIPT}</script>`;

  if (fullDocumentHtml.includes(BODY_CLOSE)) {
    return fullDocumentHtml.replace(BODY_CLOSE, `${scriptTag}\n${BODY_CLOSE}`);
  }

  return `${fullDocumentHtml}${scriptTag}`;
}
