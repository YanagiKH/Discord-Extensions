import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import { builtInPlugins } from './shared/plugin-registry';
import type { InstalledPlugin } from './shared/types';

let mainWindow: BrowserWindow | null = null;
const installedPlugins: InstalledPlugin[] = [...builtInPlugins];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    title: 'Discord Extensions',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('plugins:list', () => installedPlugins);

ipcMain.handle('plugins:toggle', (_event, pluginId: string) => {
  const plugin = installedPlugins.find((item) => item.id === pluginId);
  if (!plugin) return null;
  plugin.state = plugin.state === 'enabled' ? 'disabled' : 'enabled';
  return plugin;
});

ipcMain.handle('plugins:update-setting', (_event, pluginId: string, key: string, value: string | number | boolean) => {
  const plugin = installedPlugins.find((item) => item.id === pluginId);
  if (!plugin) return null;
  const field = plugin.settings.find((setting) => setting.key === key);
  if (!field) return null;
  field.value = value;
  return field;
});

ipcMain.handle('plugins:import', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Plugin Packages', extensions: ['zip', 'json', 'js', 'ts'] }
    ]
  });

  return result.canceled ? [] : result.filePaths;
});
