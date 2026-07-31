import { DEFAULT_SETTINGS, normalizeSettings } from './settings.js';

const PANEL_ID = 'discord-extensions-companion-panel';
const STYLE_ID = 'discord-extensions-companion-styles';

let currentSettings = normalizeSettings(DEFAULT_SETTINGS);

function applyPageTweaks(settings) {
  const root = document.documentElement;
  root.style.setProperty('--discord-extensions-font-scale', String(settings.fontScale));
  root.style.setProperty('--discord-extensions-sidebar-width', `${settings.sidebarWidth}px`);
  root.classList.toggle('discord-extensions-compact', settings.compactMode);
  root.classList.toggle('discord-extensions-reduce-motion', settings.reduceMotion);
  root.classList.toggle('discord-extensions-hide-nitro-pills', settings.hideNitroPills);
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --discord-extensions-font-scale: 1;
      --discord-extensions-sidebar-width: 320px;
    }

    html.discord-extensions-compact body {
      letter-spacing: 0;
    }

    html.discord-extensions-reduce-motion * {
      scroll-behavior: auto !important;
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }

    html.discord-extensions-hide-nitro-pills [class*='nitro'],
    html.discord-extensions-hide-nitro-pills [aria-label*='Nitro'] {
      display: none !important;
    }

    html {
      font-size: calc(100% * var(--discord-extensions-font-scale));
    }
  `;
  document.documentElement.appendChild(style);
}

function setPanelValues(panel, settings) {
  panel.querySelector('#de-compact').checked = settings.compactMode;
  panel.querySelector('#de-font').value = String(settings.fontScale);
  panel.querySelector('#de-sidebar').value = String(settings.sidebarWidth);
  panel.querySelector('#de-motion').checked = settings.reduceMotion;
  panel.querySelector('#de-nitro').checked = settings.hideNitroPills;
  panel.querySelector('#de-quick').checked = settings.showQuickControls;
}

function buildPanel(settings) {
  if (document.getElementById(PANEL_ID)) return;

  const panel = document.createElement('section');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <button id="de-toggle" type="button">Discord Extensions</button>
    <div id="de-body" hidden>
      <div class="de-header">
        <strong>Discord Extensions</strong>
        <button id="de-close" type="button">×</button>
      </div>
      <label class="de-row"><span>Compact layout</span><input id="de-compact" type="checkbox" ${settings.compactMode ? 'checked' : ''}></label>
      <label class="de-row"><span>Font scale</span><input id="de-font" type="range" min="0.85" max="1.40" step="0.05" value="${settings.fontScale}"></label>
      <label class="de-row"><span>Sidebar width</span><input id="de-sidebar" type="range" min="240" max="420" step="4" value="${settings.sidebarWidth}"></label>
      <label class="de-row"><span>Reduce motion</span><input id="de-motion" type="checkbox" ${settings.reduceMotion ? 'checked' : ''}></label>
      <label class="de-row"><span>Hide Nitro pills</span><input id="de-nitro" type="checkbox" ${settings.hideNitroPills ? 'checked' : ''}></label>
      <label class="de-row"><span>Quick controls</span><input id="de-quick" type="checkbox" ${settings.showQuickControls ? 'checked' : ''}></label>
      <p class="de-note">Open the popup to manage the same settings.</p>
    </div>
  `;

  const toggle = panel.querySelector('#de-toggle');
  const body = panel.querySelector('#de-body');
  const close = panel.querySelector('#de-close');
  toggle.addEventListener('click', () => body.toggleAttribute('hidden'));
  close.addEventListener('click', () => body.setAttribute('hidden', ''));

  const persist = async (patch) => {
    currentSettings = normalizeSettings({ ...currentSettings, ...patch });
    await chrome.storage.local.set(currentSettings);
    setPanelValues(panel, currentSettings);
    applyPageTweaks(currentSettings);
  };

  panel.querySelector('#de-compact').addEventListener('change', (event) => persist({ compactMode: event.target.checked }));
  panel.querySelector('#de-font').addEventListener('input', (event) => persist({ fontScale: Number(event.target.value) }));
  panel.querySelector('#de-sidebar').addEventListener('input', (event) => persist({ sidebarWidth: Number(event.target.value) }));
  panel.querySelector('#de-motion').addEventListener('change', (event) => persist({ reduceMotion: event.target.checked }));
  panel.querySelector('#de-nitro').addEventListener('change', (event) => persist({ hideNitroPills: event.target.checked }));
  panel.querySelector('#de-quick').addEventListener('change', (event) => persist({ showQuickControls: event.target.checked }));

  document.body.appendChild(panel);
}

async function init() {
  ensureStyles();
  currentSettings = normalizeSettings(await chrome.storage.local.get(DEFAULT_SETTINGS));
  applyPageTweaks(currentSettings);
  buildPanel(currentSettings);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    currentSettings = normalizeSettings({
      ...currentSettings,
      compactMode: changes.compactMode?.newValue,
      fontScale: changes.fontScale?.newValue,
      sidebarWidth: changes.sidebarWidth?.newValue,
      reduceMotion: changes.reduceMotion?.newValue,
      hideNitroPills: changes.hideNitroPills?.newValue,
      showQuickControls: changes.showQuickControls?.newValue
    });
    const panel = document.getElementById(PANEL_ID);
    if (panel) {
      setPanelValues(panel, currentSettings);
    }
    applyPageTweaks(currentSettings);
  });
}

void init();
