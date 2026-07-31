import { BrowserWindow, Menu, Tray, nativeImage } from 'electron';

const TRAY_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAFElEQVR42mP8/5+hHgMDAwMjI2MABxQBCV2P5w4AAAAASUVORK5CYII=';

export interface TrayCallbacks {
  showWindow: () => void;
  refreshPlugins: () => Promise<void>;
  quitApp: () => void;
}

export function createAppTray(callbacks: TrayCallbacks): Tray {
  const tray = new Tray(nativeImage.createFromDataURL(TRAY_ICON));
  tray.setToolTip('Discord Extensions');

  const buildMenu = () =>
    Menu.buildFromTemplate([
      { label: 'Open panel', click: () => callbacks.showWindow() },
      { label: 'Refresh plugins', click: () => void callbacks.refreshPlugins() },
      { type: 'separator' },
      { label: 'Quit', click: () => callbacks.quitApp() }
    ]);

  tray.setContextMenu(buildMenu());
  tray.on('click', () => callbacks.showWindow());
  tray.on('right-click', () => tray.popUpContextMenu(buildMenu()));
  return tray;
}
