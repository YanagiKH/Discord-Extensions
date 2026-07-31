import AdmZip from 'adm-zip';
import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { builtInPlugins } from '../shared/plugin-registry';
import type {
  InstalledPlugin,
  PluginImportResult,
  PluginManifest,
  PluginSettingField,
  PluginState,
  PluginStoreRecord
} from '../shared/types';
import { ensureWorkspace, getPluginsRoot, openWorkspaceFolder, readPluginStore, writePluginStore } from './persistence';

function cloneSetting(setting: PluginSettingField): PluginSettingField {
  return {
    ...setting,
    options: setting.options ? [...setting.options] : undefined
  };
}

function clonePlugin(plugin: InstalledPlugin): InstalledPlugin {
  return {
    ...plugin,
    permissions: [...plugin.permissions],
    settings: plugin.settings.map(cloneSetting)
  };
}

function sanitizeFolderName(value: string): string {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned.length > 0 ? cleaned : 'plugin';
}

function normalizeManifest(raw: unknown): PluginManifest {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Manifest must be a JSON object.');
  }

  const manifest = raw as Record<string, unknown>;
  const requiredStrings = ['id', 'name', 'version', 'description', 'author', 'entry'] as const;
  for (const key of requiredStrings) {
    if (typeof manifest[key] !== 'string' || manifest[key].trim().length === 0) {
      throw new Error(`Manifest field "${key}" is required.`);
    }
  }

  if (!Array.isArray(manifest.permissions) || !Array.isArray(manifest.settings)) {
    throw new Error('Manifest permissions and settings must be arrays.');
  }

  const permissions = manifest.permissions.filter((value): value is string => typeof value === 'string');
  const settings = manifest.settings.map((value) => {
    if (typeof value !== 'object' || value === null) {
      throw new Error('Each setting must be an object.');
    }

    const setting = value as Record<string, unknown>;
    if (typeof setting.key !== 'string' || typeof setting.label !== 'string' || typeof setting.type !== 'string') {
      throw new Error('Setting entries require key, label, and type.');
    }

    return {
      key: setting.key,
      label: setting.label,
      type: setting.type as PluginSettingField['type'],
      value: setting.value as string | number | boolean,
      options: Array.isArray(setting.options)
        ? setting.options.filter((option): option is string => typeof option === 'string')
        : undefined,
      min: typeof setting.min === 'number' ? setting.min : undefined,
      max: typeof setting.max === 'number' ? setting.max : undefined,
      step: typeof setting.step === 'number' ? setting.step : undefined
    } satisfies PluginSettingField;
  });

  return {
    id: manifest.id.trim(),
    name: manifest.name.trim(),
    version: manifest.version.trim(),
    description: manifest.description.trim(),
    author: manifest.author.trim(),
    category: ['audio', 'ui', 'automation', 'integration', 'utility'].includes(String(manifest.category))
      ? (String(manifest.category) as PluginManifest['category'])
      : 'utility',
    entry: manifest.entry.trim(),
    permissions,
    settings
  };
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function locateManifestFile(startDirectory: string): Promise<string> {
  const queue: string[] = [startDirectory];

  while (queue.length > 0) {
    const current = queue.shift() as string;
    const directManifest = path.join(current, 'plugin.json');
    if (await pathExists(directManifest)) {
      return directManifest;
    }

    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        queue.push(path.join(current, entry.name));
      }
    }
  }

  throw new Error('plugin.json was not found.');
}

function applyStore(plugin: InstalledPlugin, store: Record<string, PluginStoreRecord>): InstalledPlugin {
  const record = store[plugin.id];
  const settingsByKey = new Map<string, string | number | boolean>();
  for (const setting of plugin.settings) {
    settingsByKey.set(setting.key, setting.value);
  }

  if (record) {
    for (const [key, value] of Object.entries(record.settings)) {
      settingsByKey.set(key, value);
    }
  }

  return {
    ...clonePlugin(plugin),
    state: record ? (record.enabled ? 'enabled' : 'disabled') : plugin.state,
    settings: plugin.settings.map((setting) => ({ ...cloneSetting(setting), value: settingsByKey.get(setting.key) ?? setting.value }))
  };
}

function buildStoreRecord(plugin: InstalledPlugin): PluginStoreRecord {
  return {
    enabled: plugin.state === 'enabled',
    settings: Object.fromEntries(plugin.settings.map((setting) => [setting.key, setting.value]))
  };
}

function dedupePlugins(plugins: InstalledPlugin[]): InstalledPlugin[] {
  const ordered = new Map<string, InstalledPlugin>();
  for (const plugin of plugins) {
    ordered.set(plugin.id, plugin);
  }
  return [...ordered.values()];
}

export class PluginManager {
  private plugins: InstalledPlugin[] = [];
  private store: Record<string, PluginStoreRecord> = {};

  public async initialize(): Promise<void> {
    await ensureWorkspace();
    this.store = await readPluginStore();
    await this.refresh();
  }

  public getPlugins(): InstalledPlugin[] {
    return this.plugins.map(clonePlugin);
  }

  public async refresh(): Promise<InstalledPlugin[]> {
    await ensureWorkspace();
    this.store = await readPluginStore();

    const diskPlugins = await this.scanDiskPlugins();
    const merged = dedupePlugins([...builtInPlugins, ...diskPlugins]).map((plugin) => applyStore(plugin, this.store));

    this.plugins = merged;
    return this.getPlugins();
  }

  public async togglePlugin(pluginId: string): Promise<InstalledPlugin | null> {
    const plugin = this.plugins.find((item) => item.id === pluginId);
    if (!plugin) {
      return null;
    }

    plugin.state = plugin.state === 'enabled' ? 'disabled' : 'enabled';
    await this.persist(plugin);
    return clonePlugin(plugin);
  }

  public async updateSetting(
    pluginId: string,
    key: string,
    value: string | number | boolean
  ): Promise<{ key: string; value: string | number | boolean } | null> {
    const plugin = this.plugins.find((item) => item.id === pluginId);
    if (!plugin) {
      return null;
    }

    const setting = plugin.settings.find((entry) => entry.key === key);
    if (!setting) {
      return null;
    }

    setting.value = value;
    await this.persist(plugin);
    return { key, value };
  }

  public async importPlugins(sourcePaths: string[]): Promise<PluginImportResult> {
    const installed: InstalledPlugin[] = [];
    const failed: PluginImportResult['failed'] = [];

    for (const sourcePath of sourcePaths) {
      try {
        const imported = await this.importSingle(sourcePath);
        installed.push(imported);
      } catch (error) {
        failed.push({
          sourcePath,
          reason: error instanceof Error ? error.message : 'Unknown import error.'
        });
      }
    }

    await this.refresh();
    return {
      installed,
      failed
    };
  }

  public async openDataFolder(): Promise<string> {
    return openWorkspaceFolder();
  }

  public async setAutoStart(enabled: boolean): Promise<boolean> {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true
    });
    return app.getLoginItemSettings().openAtLogin;
  }

  private async scanDiskPlugins(): Promise<InstalledPlugin[]> {
    const pluginsRoot = getPluginsRoot();
    const entries = await fs.readdir(pluginsRoot, { withFileTypes: true }).catch(() => [] as import('node:fs').Dirent[]);
    const discovered: InstalledPlugin[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const installPath = path.join(pluginsRoot, entry.name);
      try {
        const manifestPath = await locateManifestFile(installPath);
        const manifest = normalizeManifest(JSON.parse(await fs.readFile(manifestPath, 'utf8')));
        const relativeManifestPath = path.relative(installPath, manifestPath);
        discovered.push({
          ...manifest,
          state: 'disabled',
          installPath,
          manifestPath: relativeManifestPath,
          source: 'local-import'
        });
      } catch {
        // Skip malformed folders.
      }
    }

    return discovered;
  }

  private async importSingle(sourcePath: string): Promise<InstalledPlugin> {
    const stats = await fs.stat(sourcePath);
    if (stats.isDirectory()) {
      return this.importDirectory(sourcePath);
    }

    const lower = sourcePath.toLowerCase();
    if (lower.endsWith('.zip')) {
      return this.importArchive(sourcePath);
    }

    if (lower.endsWith('.json')) {
      return this.importManifestFile(sourcePath);
    }

    throw new Error('Only folders, zip archives, or plugin.json files can be imported.');
  }

  private async importDirectory(sourcePath: string): Promise<InstalledPlugin> {
    const manifestPath = await locateManifestFile(sourcePath);
    const manifest = normalizeManifest(JSON.parse(await fs.readFile(manifestPath, 'utf8')));
    const targetRoot = path.join(getPluginsRoot(), sanitizeFolderName(manifest.id));

    await fs.rm(targetRoot, { recursive: true, force: true });
    await fs.cp(sourcePath, targetRoot, { recursive: true });

    const plugin = this.createImportedPlugin(manifest, targetRoot, path.relative(targetRoot, path.join(targetRoot, path.relative(sourcePath, manifestPath))));
    await this.persist(plugin);
    return plugin;
  }

  private async importArchive(sourcePath: string): Promise<InstalledPlugin> {
    const stagingRoot = path.join(getPluginsRoot(), '.staging', `${Date.now()}-${sanitizeFolderName(path.basename(sourcePath, '.zip'))}`);
    await fs.rm(stagingRoot, { recursive: true, force: true });
    await fs.mkdir(stagingRoot, { recursive: true });

    const archive = new AdmZip(sourcePath);
    archive.extractAllTo(stagingRoot, true);

    const manifestPath = await locateManifestFile(stagingRoot);
    const manifest = normalizeManifest(JSON.parse(await fs.readFile(manifestPath, 'utf8')));
    const targetRoot = path.join(getPluginsRoot(), sanitizeFolderName(manifest.id));
    const relativeManifestPath = path.relative(stagingRoot, manifestPath);

    await fs.rm(targetRoot, { recursive: true, force: true });
    await fs.cp(stagingRoot, targetRoot, { recursive: true });
    await fs.rm(stagingRoot, { recursive: true, force: true });

    const plugin = this.createImportedPlugin(manifest, targetRoot, relativeManifestPath);
    await this.persist(plugin);
    return plugin;
  }

  private async importManifestFile(sourcePath: string): Promise<InstalledPlugin> {
    const manifest = normalizeManifest(JSON.parse(await fs.readFile(sourcePath, 'utf8')));
    const targetRoot = path.join(getPluginsRoot(), sanitizeFolderName(manifest.id));
    await fs.rm(targetRoot, { recursive: true, force: true });
    await fs.mkdir(targetRoot, { recursive: true });
    await fs.copyFile(sourcePath, path.join(targetRoot, 'plugin.json'));

    const plugin = this.createImportedPlugin(manifest, targetRoot, 'plugin.json');
    await this.persist(plugin);
    return plugin;
  }

  private createImportedPlugin(manifest: PluginManifest, installPath: string, manifestPath: string): InstalledPlugin {
    return applyStore(
      {
        ...manifest,
        state: 'disabled',
        installPath,
        manifestPath,
        source: 'local-import'
      },
      this.store
    );
  }

  private async persist(plugin: InstalledPlugin): Promise<void> {
    this.store[plugin.id] = buildStoreRecord(plugin);
    await writePluginStore(this.store);
    this.plugins = dedupePlugins(this.plugins.map((item) => (item.id === plugin.id ? clonePlugin(plugin) : item)));
  }
}
