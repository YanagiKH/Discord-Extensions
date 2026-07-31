import type { DiscordExtensionsApi } from '../shared/ipc';
import type { InstalledPlugin, PluginImportResult, PluginSettingField } from '../shared/types';

declare global {
  interface Window {
    discordExtensions: DiscordExtensionsApi;
  }
}

const pluginList = document.getElementById('pluginList') as HTMLDivElement;
const pluginDetail = document.getElementById('pluginDetail') as HTMLDivElement;
const importBtn = document.getElementById('importBtn') as HTMLButtonElement;
const refreshBtn = document.getElementById('refreshBtn') as HTMLButtonElement;
const dataBtn = document.getElementById('dataBtn') as HTMLButtonElement;
const statusLine = document.getElementById('statusLine') as HTMLParagraphElement;

let plugins: InstalledPlugin[] = [];
let selectedPluginId: string | null = null;

function setStatus(message: string) {
  statusLine.textContent = message;
}

function renderPlugins() {
  pluginList.innerHTML = '';

  for (const plugin of plugins) {
    const card = document.createElement('button');
    card.className = `plugin-card ${selectedPluginId === plugin.id ? 'selected' : ''}`;
    card.type = 'button';
    card.innerHTML = `
      <div class="plugin-head">
        <strong>${plugin.name}</strong>
        <span class="badge ${plugin.state}">${plugin.state}</span>
      </div>
      <p>${plugin.description}</p>
      <small>${plugin.category} · v${plugin.version} · ${plugin.source} · ${plugin.installPath}</small>
    `;
    card.addEventListener('click', () => {
      selectedPluginId = plugin.id;
      renderPlugins();
      renderPluginDetail(plugin);
    });
    pluginList.appendChild(card);
  }
}

function renderPluginDetail(plugin: InstalledPlugin) {
  const settings = plugin.settings.map((field) => renderSettingRow(plugin.id, field)).join('');

  pluginDetail.innerHTML = `
    <div class="detail-head">
      <div>
        <h3>${plugin.name}</h3>
        <p>${plugin.author}</p>
      </div>
      <button id="toggleBtn" class="secondary">${plugin.state === 'enabled' ? '停用' : '啟用'}</button>
    </div>
    <div class="settings-grid">${settings}</div>
  `;

  const toggleBtn = document.getElementById('toggleBtn') as HTMLButtonElement;
  toggleBtn.addEventListener('click', async () => {
    await window.discordExtensions.togglePlugin(plugin.id);
    await refresh();
  });

  plugin.settings.forEach((field) => bindSettingControls(plugin.id, field));
}

function renderSettingRow(pluginId: string, field: PluginSettingField): string {
  if (field.type === 'toggle') {
    return `
      <label class="setting-row">
        <span>${field.label}</span>
        <input type="checkbox" data-plugin-id="${pluginId}" data-key="${field.key}" ${field.value ? 'checked' : ''} />
      </label>
    `;
  }

  if (field.type === 'range') {
    return `
      <label class="setting-row">
        <span>${field.label}: <strong>${field.value}</strong></span>
        <input type="range" min="${field.min ?? 0}" max="${field.max ?? 100}" step="${field.step ?? 1}" value="${field.value}" data-plugin-id="${pluginId}" data-key="${field.key}" />
      </label>
    `;
  }

  if (field.type === 'select') {
    const options = (field.options ?? []).map((option) => `<option ${option === field.value ? 'selected' : ''}>${option}</option>`).join('');
    return `
      <label class="setting-row">
        <span>${field.label}</span>
        <select data-plugin-id="${pluginId}" data-key="${field.key}">${options}</select>
      </label>
    `;
  }

  return `
    <label class="setting-row">
      <span>${field.label}</span>
      <input type="text" value="${field.value}" data-plugin-id="${pluginId}" data-key="${field.key}" />
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

async function refresh() {
  plugins = await window.discordExtensions.listPlugins();
  if (!selectedPluginId && plugins.length > 0) {
    selectedPluginId = plugins[0].id;
  }
  renderPlugins();

  const selected = plugins.find((plugin) => plugin.id === selectedPluginId);
  if (selected) {
    renderPluginDetail(selected);
    setStatus(`已載入 ${plugins.length} 個插件。`);
  } else {
    pluginDetail.innerHTML = '<div class="detail-empty">選擇一個插件以編輯設定。</div>';
    setStatus(`已載入 ${plugins.length} 個插件。`);
  }
}

function describeImportResult(result: PluginImportResult): string {
  const installed = result.installed.length;
  const failed = result.failed.length;
  if (installed === 0 && failed === 0) {
    return '未選擇任何可匯入的項目。';
  }
  if (failed === 0) {
    return `已匯入 ${installed} 個插件。`;
  }
  return `已匯入 ${installed} 個插件，另有 ${failed} 個項目失敗。`;
}

importBtn.addEventListener('click', async () => {
  const result = await window.discordExtensions.importPlugins();
  await refresh();
  setStatus(describeImportResult(result));
});

refreshBtn.addEventListener('click', async () => {
  await window.discordExtensions.refreshPlugins();
  await refresh();
  setStatus('已重新整理插件清單。');
});

dataBtn.addEventListener('click', async () => {
  const folder = await window.discordExtensions.openDataFolder();
  setStatus(`已開啟資料夾：${folder}`);
});

void refresh();
