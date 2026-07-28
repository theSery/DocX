import { buildPdfHtmlDocument } from './buildPdfHtmlDocument';

export const DEFAULT_TYPING_DURATION = 800;

/**
 * Types visible text evenly across the full duration (HTML tags do not
 * eat the timeline). Used by document create loading.
 *
 * @param {string} bodyHtml
 * @param {number} [durationMs]
 */
export function buildTypingAnimationHtml(bodyHtml, durationMs = DEFAULT_TYPING_DURATION) {
  const serializedHtml = JSON.stringify(bodyHtml);

  return buildPdfHtmlDocument(`
    <div id="typed-content"></div>
    <script>
      (function () {
        const fullHtml = ${serializedHtml};
        const duration = ${durationMs};
        const target = document.getElementById('typed-content');
        target.innerHTML = fullHtml;

        const textNodes = [];
        const walker = document.createTreeWalker(
          target,
          NodeFilter.SHOW_TEXT,
          null,
        );
        let current = walker.nextNode();
        while (current) {
          if (current.nodeValue && current.nodeValue.length) {
            textNodes.push({ node: current, text: current.nodeValue });
            current.nodeValue = '';
          }
          current = walker.nextNode();
        }

        const total = textNodes.reduce(function (sum, entry) {
          return sum + entry.text.length;
        }, 0);
        const start = performance.now();
        let cursorVisible = true;
        let cursorEl = null;

        function placeCursor(afterNode) {
          if (!cursorEl) {
            cursorEl = document.createElement('span');
            cursorEl.id = 'typing-cursor';
            cursorEl.setAttribute(
              'style',
              'display:inline-block;width:2px;height:1em;background:#2563eb;margin-left:1px;vertical-align:text-bottom;',
            );
          }
          if (cursorEl.parentNode) {
            cursorEl.parentNode.removeChild(cursorEl);
          }
          if (!afterNode || !afterNode.parentNode) {
            return;
          }
          if (afterNode.nextSibling) {
            afterNode.parentNode.insertBefore(cursorEl, afterNode.nextSibling);
          } else {
            afterNode.parentNode.appendChild(cursorEl);
          }
          cursorEl.style.opacity = cursorVisible ? '1' : '0';
        }

        function removeCursor() {
          if (cursorEl && cursorEl.parentNode) {
            cursorEl.parentNode.removeChild(cursorEl);
          }
        }

        function scrollToTypingPosition(animated) {
          const cursor = document.getElementById('typing-cursor');
          const behavior = animated ? 'smooth' : 'auto';

          if (cursor) {
            cursor.scrollIntoView({
              block: 'end',
              inline: 'nearest',
              behavior: behavior,
            });
            return;
          }

          window.scrollTo({
            top: document.documentElement.scrollHeight,
            left: 0,
            behavior: behavior,
          });
        }

        function reveal(charCount, showCursor) {
          let remaining = charCount;
          let lastFilled = null;

          for (var i = 0; i < textNodes.length; i++) {
            var entry = textNodes[i];
            var take = Math.min(remaining, entry.text.length);
            entry.node.nodeValue = entry.text.slice(0, take);
            remaining -= take;
            if (take > 0) {
              lastFilled = entry.node;
            }
          }

          if (showCursor) {
            placeCursor(lastFilled);
          } else {
            removeCursor();
          }

          scrollToTypingPosition(false);
        }

        function frame(now) {
          var progress = Math.min((now - start) / duration, 1);
          var len = total === 0 ? 0 : Math.floor(progress * total);
          reveal(len, progress < 1);

          if (progress < 1) {
            requestAnimationFrame(frame);
          } else {
            reveal(total, false);
            scrollToTypingPosition(true);
          }
        }

        setInterval(function () {
          cursorVisible = !cursorVisible;
          if (cursorEl && cursorEl.parentNode) {
            cursorEl.style.opacity = cursorVisible ? '1' : '0';
          }
        }, 500);

        if (total === 0) {
          return;
        }

        requestAnimationFrame(frame);
      })();
    </script>
  `);
}
