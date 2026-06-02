import { escapeHtml } from './escapeHtml';

const PLACEHOLDER_PATTERN = /\{\{([\w.-]+)\}\}/g;
const SLOT_PATTERN = /<!--\s*INJECT:([\w-]+)\s*-->/g;

/**
 * Merges backend HTML with client-side dynamic values.
 *
 * - `placeholders`: replaces `{{key}}` with escaped plain text
 * - `slots`: replaces `<!-- INJECT:slot-name -->` with raw HTML blocks
 *
 * @param {string} backendHtml
 * @param {{
 *   placeholders?: Record<string, string | number>;
 *   slots?: Record<string, string>;
 * }} injection
 */
export function mergeDocumentHtml(backendHtml, injection = {}) {
  const { placeholders = {}, slots = {} } = injection;

  let html = backendHtml.replace(PLACEHOLDER_PATTERN, (match, key) => {
    if (!(key in placeholders)) {
      return match;
    }
    return escapeHtml(placeholders[key]);
  });

  html = html.replace(SLOT_PATTERN, (match, slotName) => {
    if (!(slotName in slots)) {
      return match;
    }
    return slots[slotName] ?? '';
  });

  return html;
}
