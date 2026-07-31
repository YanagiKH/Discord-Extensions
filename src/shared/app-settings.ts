import type { UILocale } from './locales';

export interface AppSettings {
  locale: UILocale;
  autoStart: boolean;
  startHidden: boolean;
  minimizeToTray: boolean;
  compactMode: boolean;
  fontScale: number;
}

export const defaultAppSettings: AppSettings = {
  locale: 'en',
  autoStart: false,
  startHidden: false,
  minimizeToTray: true,
  compactMode: false,
  fontScale: 1
};

export type AppSettingKey = keyof AppSettings;
