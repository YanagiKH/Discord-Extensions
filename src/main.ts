import { app, BrowserWindow, dialog, ipcMain, type IpcMainInvokeEvent, type Tray } from 'electron';
import path from 'node:path';
import { defaultAppSettings, type AppSettings } from './shared/app-settings';
import { IPC_CHANNELS } from './shared/ipc';
import { createAppTray } from './main/tray';
import { PluginManager } from './main/plugin-manager';
import { readAppSettings, updateAppSettings } from './main/app-settings';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let appSettings: AppSettings = { ...defaultAppSettings };
const pluginManager = new PluginManager();

function createWindow() {
  if (mainWindow) {
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 900,
    minWidth: 1140,
    minHeight: 760,
    title: 'Discord Extensions',
    show: !appSettings.startHidden,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && appSettings.minimizeToTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  if (!appSettings.startHidden) {
    mainWindow.show();
  } else {
    mainWindow.hide();
  }

  return mainWindow;
}

function showWindow() {
  const window = createWindow();
  if (window.isMinimized()) {
    window.restore();
  }
  window.show();
  window.focus();
}

function broadcastAppSettings() {
  mainWindow?.webContents.send(IPC_CHANNELS.appSettingsUpdated, appSettings);
}

function registerIpc() {
  ipcMain.handle(IPC_CHANNELS.listPlugins, () => pluginManager.getPlugins());

  ipcMain.handle(IPC_CHANNELS.togglePlugin, async (_event: IpcMainInvokeEvent, pluginId: string) => {
    return pluginManager.togglePlugin(pluginId);
  });

  ipcMain.handle(
    IPC_CHANNELS.updateSetting,
    async (_event: IpcMainInvokeEvent, pluginId: string, key: string, value: string | number | boolean) => {
      return pluginManager.updateSetting(pluginId, key, value);
    }
  );

  ipcMain.handle(IPC_CHANNELS.importPlugins, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory', 'multiSelections'],
      filters: [
        { name: 'Plugin Packages', extensions: ['zip', 'json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { installed: [], failed: [] };
    }

    return pluginManager.importPlugins(result.filePaths);
  });

  ipcMain.handle(IPC_CHANNELS.refreshPlugins, async () => {
    const refreshed = await pluginManager.refresh();
    mainWindow?.webContents.send(IPC_CHANNELS.pluginsRefreshed);
    return refreshed;
  });

  ipcMain.handle(IPC_CHANNELS.openDataFolder, async () => pluginManager.openDataFolder());
  ipcMain.handle(IPC_CHANNELS.setAutoStart, async (_event: IpcMainInvokeEvent, enabled: boolean) => {
    appSettings = await updateAppSettings(appSettings, { autoStart: enabled });
    broadcastAppSettings();
    return pluginManager.setAutoStart(enabled);
  });

  ipcMain.handle(IPC_CHANNELS.getAppSettings, async () => appSettings);
  ipcMain.handle(IPC_CHANNELS.updateAppSettings, async (_event: IpcMainInvokeEvent, patch: Partial<AppSettings>) => {
    appSettings = await updateAppSettings(appSettings, patch);
    if (typeof patch.autoStart === 'boolean') {
      await pluginManager.setAutoStart(appSettings.autoStart);
    }
    broadcastAppSettings();
    return appSettings;
  });
}

async function startApplication() {
  appSettings = await readAppSettings();
  await pluginManager.initialize();
  await pluginManager.setAutoStart(appSettings.autoStart);
  registerIpc();
  createWindow();

  tray = createAppTray({
    showWindow,
    refreshPlugins: async () => {
      await pluginManager.refresh();
      mainWindow?.webContents.send(IPC_CHANNELS.pluginsRefreshed);
    },
    quitApp: () => {
      isQuitting = true;
      app.quit();
    }
  });

  if (!appSettings.startHidden) {
    showWindow();
  }
}

const hasSingleInstance = app.requestSingleInstanceLock();
if (!hasSingleInstance) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showWindow();
  });

  app.whenReady().then(() => {
    void startApplication();
  });

  app.on('activate', () => {
    showWindow();
  });

  app.on('before-quit', () => {
    isQuitting = true;
    tray?.destroy();
    tray = null;
  });

  app.on('window-all-closed', (event) => {
    if (!isQuitting && appSettings.minimizeToTray) {
      event.preventDefault();
    }
  });
}
