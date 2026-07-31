import { app, BrowserWindow, dialog, ipcMain, type IpcMainInvokeEvent, type Tray } from 'electron';
import path from 'node:path';
import { IPC_CHANNELS } from './shared/ipc';
import { createAppTray } from './main/tray';
import { PluginManager } from './main/plugin-manager';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
const pluginManager = new PluginManager();

function createWindow() {
  if (mainWindow) {
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    title: 'Discord Extensions',
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
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

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

  ipcMain.handle(IPC_CHANNELS.refreshPlugins, async () => pluginManager.refresh());
  ipcMain.handle(IPC_CHANNELS.openDataFolder, async () => pluginManager.openDataFolder());
  ipcMain.handle(IPC_CHANNELS.setAutoStart, async (_event: IpcMainInvokeEvent, enabled: boolean) => {
    return pluginManager.setAutoStart(enabled);
  });
}

async function startApplication() {
  await pluginManager.initialize();
  registerIpc();
  showWindow();

  tray = createAppTray({
    showWindow,
    refreshPlugins: async () => {
      await pluginManager.refresh();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('plugins:refreshed');
      }
    },
    quitApp: () => {
      isQuitting = true;
      app.quit();
    }
  });
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
    if (!isQuitting) {
      event.preventDefault();
    }
  });
}
