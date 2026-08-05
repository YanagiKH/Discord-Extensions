import { app, BrowserWindow, dialog, ipcMain, type IpcMainInvokeEvent, type Tray } from 'electron';
import path from 'node:path';
import { defaultAppSettings, type AppSettings } from './shared/app-settings';
import { IPC_CHANNELS } from './shared/ipc';
import type { CreateWorkbenchModuleRequest } from './shared/types';
import { createAppTray } from './main/tray';
import { PluginManager } from './main/plugin-manager';
import { WorkbenchManager } from './main/workbench-manager';
import { readAppSettings, updateAppSettings } from './main/app-settings';

let mainWindow: BrowserWindow | null = null;
let workbenchWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let appSettings: AppSettings = { ...defaultAppSettings };
const pluginManager = new PluginManager();
const workbenchManager = new WorkbenchManager();

function sharedWebPreferences() {
  return {
    preload: path.join(__dirname, '../preload/index.js'),
    contextIsolation: true,
    nodeIntegration: false
  };
}

function loadRendererPage(window: BrowserWindow, page: string) {
  if (process.env.VITE_DEV_SERVER_URL) {
    const base = process.env.VITE_DEV_SERVER_URL.endsWith('/')
      ? process.env.VITE_DEV_SERVER_URL
      : `${process.env.VITE_DEV_SERVER_URL}/`;
    void window.loadURL(page === 'index.html' ? base : `${base}${page}`);
  } else {
    void window.loadFile(path.join(__dirname, `../renderer/${page}`));
  }
}

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
    webPreferences: sharedWebPreferences()
  });

  loadRendererPage(mainWindow, 'index.html');

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

function createWorkbenchWindow() {
  if (workbenchWindow && !workbenchWindow.isDestroyed()) {
    workbenchWindow.show();
    workbenchWindow.focus();
    return workbenchWindow;
  }

  workbenchWindow = new BrowserWindow({
    width: 980,
    height: 780,
    minWidth: 820,
    minHeight: 680,
    title: 'Discord Extensions Module Workbench',
    parent: mainWindow ?? undefined,
    webPreferences: sharedWebPreferences()
  });
  loadRendererPage(workbenchWindow, 'workbench.html');
  workbenchWindow.on('closed', () => {
    workbenchWindow = null;
  });
  return workbenchWindow;
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

  ipcMain.handle(IPC_CHANNELS.openWorkbench, async () => {
    createWorkbenchWindow();
    return true;
  });
  ipcMain.handle(IPC_CHANNELS.listWorkbenchTemplates, () => workbenchManager.listTemplates());
  ipcMain.handle(
    IPC_CHANNELS.createWorkbenchModule,
    async (_event: IpcMainInvokeEvent, request: CreateWorkbenchModuleRequest) => {
      return workbenchManager.createModule(request);
    }
  );
  ipcMain.handle(IPC_CHANNELS.exportWorkbenchModule, async (_event: IpcMainInvokeEvent, moduleId: string) => {
    const options = {
      title: 'Export extension module',
      defaultPath: `${moduleId}.zip`,
      filters: [{ name: 'ZIP package', extensions: ['zip'] }]
    };
    const parent = workbenchWindow ?? mainWindow;
    const result = parent
      ? await dialog.showSaveDialog(parent, options)
      : await dialog.showSaveDialog(options);
    if (result.canceled || !result.filePath) {
      return null;
    }
    return workbenchManager.exportModule(moduleId, result.filePath);
  });
  ipcMain.handle(IPC_CHANNELS.openModsFolder, () => workbenchManager.openModsFolder());
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
    workbenchWindow?.destroy();
    workbenchWindow = null;
    tray?.destroy();
    tray = null;
  });

  app.on('window-all-closed', () => {
    if (!isQuitting && appSettings.minimizeToTray) {
      app.quit();
    }
  });
}
