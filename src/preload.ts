import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings } from './shared/app-settings';
import { IPC_CHANNELS } from './shared/ipc';
import type { DiscordExtensionsApi } from './shared/ipc';
import type { InstalledPlugin, PluginImportResult } from './shared/types';

function onChannel<T>(channel: string, callback: (payload: T) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: T) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

const api: DiscordExtensionsApi = {
  listPlugins: () => ipcRenderer.invoke(IPC_CHANNELS.listPlugins),
  togglePlugin: (pluginId: string) => ipcRenderer.invoke(IPC_CHANNELS.togglePlugin, pluginId),
  updateSetting: (pluginId, key, value) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateSetting, pluginId, key, value),
  importPlugins: (): Promise<PluginImportResult> => ipcRenderer.invoke(IPC_CHANNELS.importPlugins),
  refreshPlugins: () => ipcRenderer.invoke(IPC_CHANNELS.refreshPlugins),
  openDataFolder: () => ipcRenderer.invoke(IPC_CHANNELS.openDataFolder),
  setAutoStart: (enabled: boolean) => ipcRenderer.invoke(IPC_CHANNELS.setAutoStart, enabled),
  getAppSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC_CHANNELS.getAppSettings),
  updateAppSettings: (settings: Partial<AppSettings>) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateAppSettings, settings),
  onPluginsRefreshed: (callback: () => void) => onChannel<void>(IPC_CHANNELS.pluginsRefreshed, callback),
  onAppSettingsUpdated: (callback: (settings: AppSettings) => void) =>
    onChannel<AppSettings>(IPC_CHANNELS.appSettingsUpdated, callback)
};

contextBridge.exposeInMainWorld('discordExtensions', api);
