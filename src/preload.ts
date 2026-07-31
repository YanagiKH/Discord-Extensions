import { contextBridge, ipcRenderer } from 'electron';
import type { InstalledPlugin } from './shared/types';

contextBridge.exposeInMainWorld('discordExtensions', {
  listPlugins: (): Promise<InstalledPlugin[]> => ipcRenderer.invoke('plugins:list'),
  togglePlugin: (pluginId: string): Promise<InstalledPlugin | null> => ipcRenderer.invoke('plugins:toggle', pluginId),
  updateSetting: (
    pluginId: string,
    key: string,
    value: string | number | boolean
  ): Promise<{ key: string; value: string | number | boolean } | null> =>
    ipcRenderer.invoke('plugins:update-setting', pluginId, key, value),
  importPlugin: (): Promise<string[]> => ipcRenderer.invoke('plugins:import')
});
