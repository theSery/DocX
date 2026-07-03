import { buildPdfHtmlDocument } from './buildPdfHtmlDocument';

export const DEFAULT_TYPING_DURATION = 2000;

/**
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
        const total = fullHtml.length;
        const start = performance.now();
        let cursorVisible = true;

        function render(len, showCursor) {
          const cursor = showCursor
            ? '<span id="typing-cursor" style="display:inline-block;width:2px;height:1em;background:#2563eb;margin-left:1px;vertical-align:text-bottom;opacity:' +
              (cursorVisible ? 1 : 0) +
              ';"></span>'
            : '';
          target.innerHTML = fullHtml.slice(0, len) + cursor;
          scrollToTypingPosition(false);
        }

        function scrollToTypingPosition(animated) {
          const cursor = document.getElementById('typing-cursor');
          const behavior = animated ? 'smooth' : 'auto';

          if (cursor) {
            cursor.scrollIntoView({
              block: 'end',
              inline: 'nearest',
              behavior,
            });
            return;
          }

          window.scrollTo({
            top: document.documentElement.scrollHeight,
            left: 0,
            behavior,
          });
        }

        function frame(now) {
          const progress = Math.min((now - start) / duration, 1);
          const len = Math.floor(progress * total);
          render(len, progress < 1);

          if (progress < 1) {
            requestAnimationFrame(frame);
          } else {
            scrollToTypingPosition(true);
          }
        }

        setInterval(function () {
          cursorVisible = !cursorVisible;
          const cursor = document.getElementById('typing-cursor');
          if (cursor) {
            cursor.style.opacity = cursorVisible ? 1 : 0;
          }
        }, 500);

        requestAnimationFrame(frame);
      })();
    </script>
  `);
}
