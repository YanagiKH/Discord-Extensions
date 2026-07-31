import type { AppSettings } from '../shared/app-settings';
import { getLocaleBundle, listLocaleOptions, type LocaleBundle, type UILocale } from '../shared/locales';
import type { DiscordExtensionsApi } from '../shared/ipc';
import type { InstalledPlugin, PluginImportResult, PluginSettingField } from '../shared/types';

declare global {
  interface Window {
    discordExtensions: DiscordExtensionsApi;
  }
}

const appTitle = document.getElementById('appTitle') as HTMLHeadingElement;
const appSubtitle = document.getElementById('appSubtitle') as HTMLParagraphElement;
const languageLabel = document.getElementById('languageLabel') as HTMLSpanElement;
const languageSelect = document.getElementById('languageSelect') as HTMLSelectElement;
const importBtn = document.getElementById('importBtn') as HTMLButtonElement;
const refreshBtn = document.getElementById('refreshBtn') as HTMLButtonElement;
const dataBtn = document.getElementById('dataBtn') as HTMLButtonElement;
const statusLine = document.getElementById('statusLine') as HTMLParagraphElement;
const pluginsHeader = document.getElementById('pluginsHeader') as HTMLHeadingElement;
const detailsHeader = document.getElementById('detailsHeader') as HTMLHeadingElement;
const globalSettingsHeader = document.getElementById('globalSettingsHeader') as HTMLHeadingElement;
const pluginList = document.getElementById('pluginList') as HTMLDivElement;
const pluginDetail = document.getElementById('pluginDetail') as HTMLDivElement;
const globalSettings = document.getElementById('globalSettings') as HTMLDivElement;

let plugins: InstalledPlugin[] = [];
let selectedPluginId: string | null = null;
let appSettings: AppSettings | null = null;
let localeBundle: LocaleBundle = getLocaleBundle('en');

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setStatus(message: string) {
  statusLine.textContent = message;
}

function applyLocalization(locale: UILocale) {
  localeBundle = getLocaleBundle(locale);
  document.documentElement.lang = locale;
  appTitle.textContent = localeBundle.title;
  appSubtitle.textContent = localeBundle.subtitle;
  languageLabel.textContent = localeBundle.toolbar.language;
  importBtn.textContent = localeBundle.toolbar.importPlugins;
  refreshBtn.textContent = localeBundle.toolbar.refresh;
  dataBtn.textContent = localeBundle.toolbar.openDataFolder;
  pluginsHeader.textContent = localeBundle.sections.plugins;
  detailsHeader.textContent = localeBundle.sections.pluginDetails;
  globalSettingsHeader.textContent = localeBundle.sections.globalSettings;

  languageSelect.innerHTML = listLocaleOptions()
    .map((option) => `<option value="${option.value}" ${option.value === locale ? 'selected' : ''}>${escapeHtml(option.label)}</option>`)
    .join('');
}

function applyVisualSettings() {
  if (!appSettings) return;
  document.documentElement.style.setProperty('--font-scale', String(appSettings.fontScale));
  document.body.classList.toggle('compact-mode', appSettings.compactMode);
}

function describeSource(source: InstalledPlugin['source']): string {
  if (source === 'built-in') return localeBundle.labels.builtIn;
  if (source === 'local-import') return localeBundle.labels.imported;
  return 'Package';
}

function renderPlugins() {
  pluginList.innerHTML = '';

  for (const plugin of plugins) {
    const card = document.createElement('button');
    card.className = `plugin-card ${selectedPluginId === plugin.id ? 'selected' : ''}`;
    card.type = 'button';
    card.innerHTML = `
      <div class="plugin-head">
        <strong>${escapeHtml(plugin.name)}</strong>
        <span class="badge ${plugin.state}">${plugin.state === 'enabled' ? localeBundle.labels.enabled : localeBundle.labels.disabled}</span>
      </div>
      <p>${escapeHtml(plugin.description)}</p>
      <small>${escapeHtml(plugin.category)} · v${escapeHtml(plugin.version)} · ${escapeHtml(describeSource(plugin.source))}</small>
      <small>${escapeHtml(localeBundle.labels.state)}: ${escapeHtml(plugin.state === 'enabled' ? localeBundle.labels.enabled : localeBundle.labels.disabled)}</small>
    `;
    card.addEventListener('click', () => {
      selectedPluginId = plugin.id;
      renderPlugins();
      renderPluginDetail(plugin);
    });
    pluginList.appendChild(card);
  }
}

function renderSettingRow(pluginId: string, field: PluginSettingField): string {
  const label = escapeHtml(field.label);
  if (field.type === 'toggle') {
    return `
      <label class="setting-row">
        <span>${label}</span>
        <input type="checkbox" data-plugin-id="${pluginId}" data-key="${field.key}" ${field.value ? 'checked' : ''} />
      </label>
    `;
  }

  if (field.type === 'range') {
    return `
      <label class="setting-row">
        <span>${label}: <strong>${escapeHtml(String(field.value))}</strong></span>
        <input type="range" min="${field.min ?? 0}" max="${field.max ?? 100}" step="${field.step ?? 1}" value="${escapeHtml(String(field.value))}" data-plugin-id="${pluginId}" data-key="${field.key}" />
      </label>
    `;
  }

  if (field.type === 'select') {
    const options = (field.options ?? [])
      .map((option) => `<option value="${escapeHtml(option)}" ${option === field.value ? 'selected' : ''}>${escapeHtml(option)}</option>`)
      .join('');
    return `
      <label class="setting-row">
        <span>${label}</span>
        <select data-plugin-id="${pluginId}" data-key="${field.key}">${options}</select>
      </label>
    `;
  }

  return `
    <label class="setting-row">
      <span>${label}</span>
      <input type="text" value="${escapeHtml(String(field.value))}" data-plugin-id="${pluginId}" data-key="${field.key}" />
    </label>
  `;
}

function bindSettingControls(pluginId: string, field: PluginSettingField) {
  const selector = `[data-plugin-id="${pluginId}"][data-key="${field.key}"]`;
  const control = pluginDetail.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
  if (!control) return;

  control.addEventListener('change', async () => {
    let nextValue: string | number | boolean = control.value;

    if (field.type === 'toggle' && control instanceof HTMLInputElement) {
      nextValue = control.checked;
    } else if (field.type === 'range') {
      nextValue = Number(control.value);
      const label = control.parentElement?.querySelector('strong');
      if (label) {
        label.textContent = control.value;
      }
    }

    await window.discordExtensions.updateSetting(pluginId, field.key, nextValue);
  });
}

function renderPluginDetail(plugin: InstalledPlugin) {
  const settings = plugin.settings.map((field) => renderSettingRow(plugin.id, field)).join('');

  pluginDetail.innerHTML = `
    <div class="detail-head">
      <div>
        <h3>${escapeHtml(plugin.name)}</h3>
        <p>${escapeHtml(plugin.author)} · ${escapeHtml(plugin.entry)}</p>
      </div>
      <button id="toggleBtn" class="secondary">${plugin.state === 'enabled' ? localeBundle.labels.disabled : localeBundle.labels.enabled}</button>
    </div>
    <div class="detail-meta">
      <small>${escapeHtml(localeBundle.labels.state)}: ${escapeHtml(plugin.state === 'enabled' ? localeBundle.labels.enabled : localeBundle.labels.disabled)}</small>
      <small>${escapeHtml(plugin.permissions.join(' · '))}</small>
    </div>
    <div class="settings-grid">${settings}</div>
  `;

  const toggleBtn = document.getElementById('toggleBtn') as HTMLButtonElement;
  toggleBtn.addEventListener('click', async () => {
    await window.discordExtensions.togglePlugin(plugin.id);
    await refreshPlugins();
  });

  plugin.settings.forEach((field) => bindSettingControls(plugin.id, field));
}

function renderGlobalSettings() {
  if (!appSettings) return;

  globalSettings.innerHTML = `
    <label class="setting-row">
      <span>${escapeHtml(localeBundle.labels.autoStart)}</span>
      <input id="settingAutoStart" type="checkbox" ${appSettings.autoStart ? 'checked' : ''} />
    </label>
    <label class="setting-row">
      <span>${escapeHtml(localeBundle.labels.startHidden)}</span>
      <input id="settingStartHidden" type="checkbox" ${appSettings.startHidden ? 'checked' : ''} />
    </label>
    <label class="setting-row">
      <span>${escapeHtml(localeBundle.labels.minimizeToTray)}</span>
      <input id="settingMinimizeToTray" type="checkbox" ${appSettings.minimizeToTray ? 'checked' : ''} />
    </label>
    <label class="setting-row">
      <span>${escapeHtml(localeBundle.labels.compactMode)}</span>
      <input id="settingCompactMode" type="checkbox" ${appSettings.compactMode ? 'checked' : ''} />
    </label>
    <label class="setting-row">
      <span>${escapeHtml(localeBundle.labels.fontScale)}: <strong>${appSettings.fontScale.toFixed(2)}</strong></span>
      <input id="settingFontScale" type="range" min="0.85" max="1.4" step="0.05" value="${appSettings.fontScale}" />
    </label>
    <div class="setting-row buttons-row">
      <button id="resetSettingsBtn" class="secondary" type="button">${escapeHtml(localeBundle.labels.safeDefaults)}</button>
      <button id="workspaceBtn" class="primary" type="button">${escapeHtml(localeBundle.labels.openWorkspace)}</button>
    </div>
    <p class="hint-text">${escapeHtml(localeBundle.labels.importHint)}</p>
  `;

  const autoStart = document.getElementById('settingAutoStart') as HTMLInputElement;
  const startHidden = document.getElementById('settingStartHidden') as HTMLInputElement;
  const minimizeToTray = document.getElementById('settingMinimizeToTray') as HTMLInputElement;
  const compactMode = document.getElementById('settingCompactMode') as HTMLInputElement;
  const fontScale = document.getElementById('settingFontScale') as HTMLInputElement;
  const resetSettingsBtn = document.getElementById('resetSettingsBtn') as HTMLButtonElement;
  const workspaceBtn = document.getElementById('workspaceBtn') as HTMLButtonElement;

  autoStart.addEventListener('change', async () => {
    appSettings = await window.discordExtensions.updateAppSettings({ autoStart: autoStart.checked });
    applyLocalization(appSettings.locale);
    applyVisualSettings();
    renderGlobalSettings();
  });

  startHidden.addEventListener('change', async () => {
    appSettings = await window.discordExtensions.updateAppSettings({ startHidden: startHidden.checked });
    applyVisualSettings();
    renderGlobalSettings();
  });

  minimizeToTray.addEventListener('change', async () => {
    appSettings = await window.discordExtensions.updateAppSettings({ minimizeToTray: minimizeToTray.checked });
    renderGlobalSettings();
  });

  compactMode.addEventListener('change', async () => {
    appSettings = await window.discordExtensions.updateAppSettings({ compactMode: compactMode.checked });
    applyVisualSettings();
    renderGlobalSettings();
  });

  fontScale.addEventListener('input', async () => {
    const value = Number(fontScale.value);
    const label = fontScale.parentElement?.querySelector('strong');
    if (label) {
      label.textContent = value.toFixed(2);
    }
    appSettings = await window.discordExtensions.updateAppSettings({ fontScale: value });
    applyVisualSettings();
  });

  resetSettingsBtn.addEventListener('click', async () => {
    appSettings = await window.discordExtensions.updateAppSettings({
      autoStart: false,
      startHidden: false,
      minimizeToTray: true,
      compactMode: false,
      fontScale: 1,
      locale: 'en'
    });
    applyLocalization(appSettings.locale);
    applyVisualSettings();
    renderGlobalSettings();
    await refreshPlugins();
  });

  workspaceBtn.addEventListener('click', async () => {
    const folder = await window.discordExtensions.openDataFolder();
    setStatus(`${localeBundle.labels.openWorkspace}: ${folder}`);
  });
}

async function refreshPlugins() {
  plugins = await window.discordExtensions.listPlugins();
  if (!selectedPluginId && plugins.length > 0) {
    selectedPluginId = plugins[0].id;
  }
  renderPlugins();

  const selected = plugins.find((plugin) => plugin.id === selectedPluginId);
  if (selected) {
    renderPluginDetail(selected);
    setStatus(`${plugins.length} ${localeBundle.status.loaded}`);
  } else {
    pluginDetail.innerHTML = `<div class="detail-empty">${escapeHtml(localeBundle.labels.selectPlugin)}</div>`;
    setStatus(localeBundle.status.noneSelected);
  }
}

function describeImportResult(result: PluginImportResult): string {
  const installed = result.installed.length;
  const failed = result.failed.length;
  if (installed === 0 && failed === 0) {
    return localeBundle.labels.importHint;
  }
  if (failed === 0) {
    return localeBundle.status.imported;
  }
  return localeBundle.status.importedWithFailures;
}

async function loadAppSettings() {
  appSettings = await window.discordExtensions.getAppSettings();
  applyLocalization(appSettings.locale);
  applyVisualSettings();
  renderGlobalSettings();

  languageSelect.innerHTML = listLocaleOptions()
    .map((option) => `<option value="${option.value}" ${option.value === appSettings?.locale ? 'selected' : ''}>${escapeHtml(option.label)}</option>`)
    .join('');
}

languageSelect.addEventListener('change', async () => {
  const locale = languageSelect.value as UILocale;
  appSettings = await window.discordExtensions.updateAppSettings({ locale });
  applyLocalization(appSettings.locale);
  applyVisualSettings();
  renderGlobalSettings();
  renderPlugins();
});

importBtn.addEventListener('click', async () => {
  const result = await window.discordExtensions.importPlugins();
  await refreshPlugins();
  setStatus(describeImportResult(result));
});

refreshBtn.addEventListener('click', async () => {
  await window.discordExtensions.refreshPlugins();
  await refreshPlugins();
  setStatus(localeBundle.status.refreshed);
});

dataBtn.addEventListener('click', async () => {
  const folder = await window.discordExtensions.openDataFolder();
  setStatus(`${localeBundle.labels.openWorkspace}: ${folder}`);
});

window.discordExtensions.onPluginsRefreshed(() => {
  void refreshPlugins();
});

window.discordExtensions.onAppSettingsUpdated((settings) => {
  appSettings = settings;
  applyLocalization(settings.locale);
  applyVisualSettings();
  renderGlobalSettings();
  renderPlugins();
});

async function initialize() {
  setStatus(localeBundle.status.loading);
  await loadAppSettings();
  await refreshPlugins();
}

void initialize();
