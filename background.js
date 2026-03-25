// background.js
// Cleans up stored volume when a tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
  browser.storage.local.remove(`vol_${tabId}`);
});
