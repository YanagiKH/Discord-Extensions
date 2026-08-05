import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings } from './shared/app-settings';
import { IPC_CHANNELS } from './shared/ipc';
import type { DiscordExtensionsApi } from './shared/ipc';
import type {
  CreateWorkbenchModuleRequest,
  PluginImportResult,
  WorkbenchModuleResult,
  WorkbenchTemplate
} from './shared/types';

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
  openWorkbench: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.openWorkbench),
  listWorkbenchTemplates: (): Promise<WorkbenchTemplate[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.listWorkbenchTemplates),
  createWorkbenchModule: (request: CreateWorkbenchModuleRequest): Promise<WorkbenchModuleResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.createWorkbenchModule, request),
  exportWorkbenchModule: (moduleId: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.exportWorkbenchModule, moduleId),
  openModsFolder: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.openModsFolder),
  onPluginsRefreshed: (callback: () => void) => onChannel<void>(IPC_CHANNELS.pluginsRefreshed, callback),
  onAppSettingsUpdated: (callback: (settings: AppSettings) => void) =>
    onChannel<AppSettings>(IPC_CHANNELS.appSettingsUpdated, callback)
};

contextBridge.exposeInMainWorld('discordExtensions', api);
