const SHEET_DISMISS_DELAY_MS = 350;

function scheduleIdleTask(callback) {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback);
    return;
  }

  setTimeout(callback, 0);
}

export function runAfterSheetDismiss(callback) {
  scheduleIdleTask(() => {
    setTimeout(callback, SHEET_DISMISS_DELAY_MS);
  });
}
