/**
 * Injected into the preview WebView. Types text nodes in document order using
 * a time-based batch loop (requestAnimationFrame) for smooth performance.
 */
export const DOCUMENT_TYPING_ANIMATION_SCRIPT = `
(function () {
  var MS_PER_CHAR = 18;
  var PAUSE_AFTER_PUNCTUATION_MS = 72;
  var PUNCTUATION = /[.,։:;!?]/;
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1 };

  function delayAfterChar(ch) {
    if (!ch) return 0;
    if (PUNCTUATION.test(ch)) return PAUSE_AFTER_PUNCTUATION_MS;
    return 0;
  }

  function collectTextNodes(root, out) {
    var child = root.firstChild;
    while (child) {
      if (child.nodeType === 3) {
        var text = child.textContent;
        if (text) {
          out.push({ node: child, full: text });
          child.textContent = '';
        }
      } else if (child.nodeType === 1 && !SKIP_TAGS[child.tagName]) {
        collectTextNodes(child, out);
      }
      child = child.nextSibling;
    }
  }

  function buildQueue(textNodes) {
    var queue = [];
    for (var i = 0; i < textNodes.length; i++) {
      var full = textNodes[i].full;
      var node = textNodes[i].node;
      for (var j = 0; j < full.length; j++) {
        queue.push({ node: node, ch: full[j] });
      }
    }
    return queue;
  }

  function notifyComplete() {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'TYPING_COMPLETE' })
      );
    }
  }

  function startTyping() {
    if (!document.body) {
      notifyComplete();
      return;
    }

    var textNodes = [];
    collectTextNodes(document.body, textNodes);
    var queue = buildQueue(textNodes);

    if (!queue.length) {
      notifyComplete();
      return;
    }

    var index = 0;
    var currentNode = null;
    var carry = 0;
    var extraDelay = 0;
    var lastTime = performance.now();

    function step(now) {
      var elapsed = now - lastTime;
      lastTime = now;

      var budget = carry + elapsed / MS_PER_CHAR;
      var count = Math.min(Math.floor(budget), queue.length - index);
      carry = budget - count;

      if (count > 0) {
        for (var n = 0; n < count; n++) {
          var item = queue[index++];
          if (item.node !== currentNode) {
            currentNode = item.node;
          }
          currentNode.textContent += item.ch;
          extraDelay = Math.max(extraDelay, delayAfterChar(item.ch));
        }
      }

      if (index >= queue.length) {
        notifyComplete();
        return;
      }

      var wait = extraDelay;
      extraDelay = 0;
      setTimeout(function () {
        requestAnimationFrame(step);
      }, wait);
    }

    requestAnimationFrame(step);
  }

  function whenReady(fn) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fn).catch(fn);
    } else if (document.readyState === 'complete') {
      fn();
    } else {
      window.addEventListener('load', fn, { once: true });
    }
  }

  whenReady(startTyping);
})();
true;
`;
