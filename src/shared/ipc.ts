import type { AppSettings } from './app-settings';
import type { InstalledPlugin, PluginImportResult } from './types';

export const IPC_CHANNELS = {
  listPlugins: 'plugins:list',
  togglePlugin: 'plugins:toggle',
  updateSetting: 'plugins:update-setting',
  importPlugins: 'plugins:import',
  refreshPlugins: 'plugins:refresh',
  openDataFolder: 'app:open-data-folder',
  setAutoStart: 'app:set-autostart',
  getAppSettings: 'app:get-settings',
  updateAppSettings: 'app:update-settings',
  pluginsRefreshed: 'plugins:refreshed',
  appSettingsUpdated: 'app:settings-updated'
} as const;

export interface DiscordExtensionsApi {
  listPlugins: () => Promise<InstalledPlugin[]>;
  togglePlugin: (pluginId: string) => Promise<InstalledPlugin | null>;
  updateSetting: (
    pluginId: string,
    key: string,
    value: string | number | boolean
  ) => Promise<{ key: string; value: string | number | boolean } | null>;
  importPlugins: () => Promise<PluginImportResult>;
  refreshPlugins: () => Promise<InstalledPlugin[]>;
  openDataFolder: () => Promise<string>;
  setAutoStart: (enabled: boolean) => Promise<boolean>;
  getAppSettings: () => Promise<AppSettings>;
  updateAppSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  onPluginsRefreshed: (callback: () => void) => () => void;
  onAppSettingsUpdated: (callback: (settings: AppSettings) => void) => () => void;
}
