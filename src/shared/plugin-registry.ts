import type { InstalledPlugin, PluginManifest, PluginSettingField } from './types';

const volumeLockSettings: PluginSettingField[] = [
  {
    key: 'targetVolume',
    label: 'Target volume',
    type: 'range',
    value: 70,
    min: 0,
    max: 100,
    step: 1
  },
  {
    key: 'autoNormalize',
    label: 'Auto normalize',
    type: 'toggle',
    value: true
  },
  {
    key: 'showBadge',
    label: 'Show status badge',
    type: 'toggle',
    value: true
  }
];

export const builtInPlugins: InstalledPlugin[] = [
  {
    id: 'volume-lock',
    name: 'Volume Lock',
    version: '1.0.0',
    description: 'Keeps incoming voice levels within a safe range.',
    author: 'YanagiKH',
    category: 'audio',
    entry: 'volume-lock.ts',
    permissions: ['voice-volume-read', 'voice-volume-normalize', 'ui-panel', 'settings-persistence'],
    settings: volumeLockSettings.map((setting) => ({ ...setting })),
    state: 'enabled',
    installPath: 'builtin/volume-lock',
    manifestPath: 'builtin/volume-lock/plugin.json',
    source: 'built-in'
  }
];

export function createPluginManifest(partial: Omit<PluginManifest, 'permissions'> & { permissions?: PluginManifest['permissions'] }): PluginManifest {
  return {
    ...partial,
    permissions: partial.permissions ?? [],
    settings: partial.settings.map((setting) => ({ ...setting }))
  };
}

export function formatSettingValue(field: PluginSettingField): string {
  if (typeof field.value === 'boolean') return field.value ? 'On' : 'Off';
  return String(field.value);
}
