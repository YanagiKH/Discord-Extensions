import type { InstalledPlugin, PluginManifest, PluginSettingField } from './types';

export const builtInPlugins: InstalledPlugin[] = [
  {
    id: 'volume-lock',
    name: 'Volume Lock',
    version: '1.0.0',
    description: 'Keeps incoming voice levels within a safe range.',
    author: 'YanagiKH',
    state: 'enabled',
    category: 'audio',
    installPath: 'plugins/volume-lock',
    source: 'built-in',
    settings: [
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
    ]
  }
];

export function createPluginManifest(partial: Omit<PluginManifest, 'state'>): PluginManifest {
  return {
    ...partial,
    state: 'disabled'
  };
}

export function formatSettingValue(field: PluginSettingField): string {
  if (typeof field.value === 'boolean') return field.value ? 'On' : 'Off';
  return String(field.value);
}
