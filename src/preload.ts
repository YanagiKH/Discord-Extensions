import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './shared/ipc';
import type { DiscordExtensionsApi } from './shared/ipc';
import type { PluginImportResult } from './shared/types';

const api: DiscordExtensionsApi = {
  listPlugins: () => ipcRenderer.invoke(IPC_CHANNELS.listPlugins),
  togglePlugin: (pluginId: string) => ipcRenderer.invoke(IPC_CHANNELS.togglePlugin, pluginId),
  updateSetting: (pluginId, key, value) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateSetting, pluginId, key, value),
  importPlugins: (): Promise<PluginImportResult> => ipcRenderer.invoke(IPC_CHANNELS.importPlugins),
  refreshPlugins: () => ipcRenderer.invoke(IPC_CHANNELS.refreshPlugins),
  openDataFolder: () => ipcRenderer.invoke(IPC_CHANNELS.openDataFolder),
  setAutoStart: (enabled: boolean) => ipcRenderer.invoke(IPC_CHANNELS.setAutoStart, enabled)
};

contextBridge.exposeInMainWorld('discordExtensions', api);
