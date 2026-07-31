import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { defaultAppSettings, type AppSettingKey, type AppSettings } from '../shared/app-settings';

const WORKSPACE_NAME = 'Discord Extensions';

function getWorkspaceRoot(): string {
  return path.join(app.getPath('userData'), WORKSPACE_NAME);
}

function getSettingsPath(): string {
  return path.join(getWorkspaceRoot(), 'app-settings.json');
}

async function ensureWorkspace(): Promise<void> {
  await fs.mkdir(getWorkspaceRoot(), { recursive: true });
}

function sanitizeSettings(input: Partial<AppSettings>): AppSettings {
  return {
    locale: input.locale ?? defaultAppSettings.locale,
    autoStart: Boolean(input.autoStart ?? defaultAppSettings.autoStart),
    startHidden: Boolean(input.startHidden ?? defaultAppSettings.startHidden),
    minimizeToTray: Boolean(input.minimizeToTray ?? defaultAppSettings.minimizeToTray),
    compactMode: Boolean(input.compactMode ?? defaultAppSettings.compactMode),
    fontScale: typeof input.fontScale === 'number' && Number.isFinite(input.fontScale)
      ? Math.min(1.4, Math.max(0.85, input.fontScale))
      : defaultAppSettings.fontScale
  };
}

export async function readAppSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(getSettingsPath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return sanitizeSettings(parsed);
  } catch {
    return defaultAppSettings;
  }
}

export async function writeAppSettings(settings: AppSettings): Promise<void> {
  await ensureWorkspace();
  await fs.writeFile(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8');
}

export async function updateAppSettings(current: AppSettings, patch: Partial<AppSettings>): Promise<AppSettings> {
  const next = sanitizeSettings({ ...current, ...patch });
  await writeAppSettings(next);
  return next;
}

export function toSettingPayload(settings: AppSettings): AppSettings {
  return sanitizeSettings(settings);
}

export function normalizeAppSettingValue(key: AppSettingKey, value: unknown): AppSettings[AppSettingKey] {
  const base = defaultAppSettings[key];
  if (typeof base === 'boolean') {
    return Boolean(value);
  }
  if (typeof base === 'number') {
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : base;
  }
  return typeof value === 'string' && value.length > 0 ? (value as AppSettings[AppSettingKey]) : base;
}
