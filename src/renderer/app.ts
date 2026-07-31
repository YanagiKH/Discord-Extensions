import type { InstalledPlugin, PluginSettingField } from '../shared/types';

declare global {
  interface Window {
    discordExtensions: {
      listPlugins: () => Promise<InstalledPlugin[]>;
      togglePlugin: (pluginId: string) => Promise<InstalledPlugin | null>;
      updateSetting: (
        pluginId: string,
        key: string,
        value: string | number | boolean
      ) => Promise<{ key: string; value: string | number | boolean } | null>;
      importPlugin: () => Promise<string[]>;
    };
  }
}

const pluginList = document.getElementById('pluginList') as HTMLDivElement;
const pluginDetail = document.getElementById('pluginDetail') as HTMLDivElement;
const importBtn = document.getElementById('importBtn') as HTMLButtonElement;

let plugins: InstalledPlugin[] = [];
let selectedPluginId: string | null = null;

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
      <small>${plugin.category} · v${plugin.version} · ${plugin.source}</small>
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
  const settings = plugin.settings
    .map((field) => renderSettingRow(plugin.id, field))
    .join('');

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

  return `
    <label class="setting-row">
      <span>${field.label}</span>
      <input type="text" value="${field.value}" data-plugin-id="${pluginId}" data-key="${field.key}" />
    </label>
  `;
}

function bindSettingControls(pluginId: string, field: PluginSettingField) {
  const selector = `[data-plugin-id="${pluginId}"][data-key="${field.key}"]`;
  const control = pluginDetail.querySelector<HTMLInputElement>(selector);
  if (!control) return;

  control.addEventListener('change', async () => {
    let nextValue: string | number | boolean = control.value;

    if (field.type === 'toggle') {
      nextValue = control.checked;
    } else if (field.type === 'range') {
      nextValue = Number(control.value);
      const label = control.parentElement?.querySelector('strong');
      if (label) label.textContent = control.value;
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
  } else {
    pluginDetail.innerHTML = '<div class="detail-empty">選擇一個插件以編輯設定。</div>';
  }
}

importBtn.addEventListener('click', async () => {
  const imported = await window.discordExtensions.importPlugin();
  if (imported.length > 0) {
    alert(`已選擇 ${imported.length} 個檔案，後續可接上安裝流程。`);
  }
});

void refresh();
