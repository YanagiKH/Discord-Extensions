import { DEFAULT_SETTINGS, normalizeSettings } from './settings.js';

const compactMode = document.getElementById('compactMode');
const fontScale = document.getElementById('fontScale');
const sidebarWidth = document.getElementById('sidebarWidth');
const reduceMotion = document.getElementById('reduceMotion');
const hideNitroPills = document.getElementById('hideNitroPills');
const showQuickControls = document.getElementById('showQuickControls');
const fontScaleLabel = document.getElementById('fontScaleLabel');
const sidebarLabel = document.getElementById('sidebarLabel');
const saveBtn = document.getElementById('saveBtn');

async function loadSettings() {
  const current = normalizeSettings(await chrome.storage.local.get(DEFAULT_SETTINGS));
  compactMode.checked = current.compactMode;
  fontScale.value = String(current.fontScale);
  sidebarWidth.value = String(current.sidebarWidth);
  reduceMotion.checked = current.reduceMotion;
  hideNitroPills.checked = current.hideNitroPills;
  showQuickControls.checked = current.showQuickControls;
  fontScaleLabel.textContent = current.fontScale.toFixed(2);
  sidebarLabel.textContent = String(current.sidebarWidth);
}

function readSettings() {
  return normalizeSettings({
    compactMode: compactMode.checked,
    fontScale: Number(fontScale.value),
    sidebarWidth: Number(sidebarWidth.value),
    reduceMotion: reduceMotion.checked,
    hideNitroPills: hideNitroPills.checked,
    showQuickControls: showQuickControls.checked
  });
}

fontScale.addEventListener('input', () => {
  fontScaleLabel.textContent = Number(fontScale.value).toFixed(2);
});

sidebarWidth.addEventListener('input', () => {
  sidebarLabel.textContent = String(Number(sidebarWidth.value));
});

saveBtn.addEventListener('click', async () => {
  const next = readSettings();
  await chrome.storage.local.set(next);
  window.close();
});

await loadSettings();
