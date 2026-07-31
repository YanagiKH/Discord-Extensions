import { DEFAULT_SETTINGS, normalizeSettings } from './settings.js';

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(DEFAULT_SETTINGS);
  await chrome.storage.local.set(normalizeSettings(current));
});

chrome.action.onClicked.addListener(async () => {
  const current = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const next = normalizeSettings(current);
  await chrome.storage.local.set({ ...next, showQuickControls: true });
});
