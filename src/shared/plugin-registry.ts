import type { InstalledPlugin, PluginManifest, PluginSettingField } from './types';

const builtInVolumeLockSettings: PluginSettingField[] = [
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

const voiceComfortSettings: PluginSettingField[] = [
  {
    key: 'softCap',
    label: 'Soft cap',
    type: 'range',
    value: 65,
    min: 0,
    max: 100,
    step: 1
  },
  {
    key: 'raiseQuietSpeakers',
    label: 'Raise quiet speakers',
    type: 'toggle',
    value: true
  }
];

const focusModeSettings: PluginSettingField[] = [
  {
    key: 'muteNotifications',
    label: 'Mute notifications',
    type: 'toggle',
    value: true
  },
  {
    key: 'dimSidebar',
    label: 'Dim sidebar',
    type: 'toggle',
    value: true
  },
  {
    key: 'sessionLength',
    label: 'Session length (minutes)',
    type: 'range',
    value: 45,
    min: 15,
    max: 240,
    step: 15
  }
];

const quickLauncherSettings: PluginSettingField[] = [
  {
    key: 'showQuickActions',
    label: 'Show quick actions',
    type: 'toggle',
    value: true
  },
  {
    key: 'openOnHotkey',
    label: 'Open on hotkey',
    type: 'toggle',
    value: true
  },
  {
    key: 'hotkey',
    label: 'Hotkey',
    type: 'text',
    value: 'Ctrl+Shift+Space'
  }
];

const compactSidebarSettings: PluginSettingField[] = [
  {
    key: 'density',
    label: 'Density',
    type: 'select',
    value: 'comfortable',
    options: ['compact', 'balanced', 'comfortable']
  },
  {
    key: 'showChannelBadges',
    label: 'Show channel badges',
    type: 'toggle',
    value: false
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
    settings: builtInVolumeLockSettings.map((setting) => ({ ...setting })),
    state: 'enabled',
    installPath: 'builtin/volume-lock',
    manifestPath: 'builtin/volume-lock/plugin.json',
    source: 'built-in'
  },
  {
    id: 'voice-comfort',
    name: 'Voice Comfort',
    version: '1.0.0',
    description: 'Balances loud and quiet speakers for a more even voice chat session.',
    author: 'YanagiKH',
    category: 'audio',
    entry: 'voice-comfort.ts',
    permissions: ['voice-volume-read', 'voice-volume-normalize', 'ui-panel', 'settings-persistence'],
    settings: voiceComfortSettings.map((setting) => ({ ...setting })),
    state: 'disabled',
    installPath: 'builtin/voice-comfort',
    manifestPath: 'builtin/voice-comfort/plugin.json',
    source: 'built-in'
  },
  {
    id: 'focus-mode',
    name: 'Focus Mode',
    version: '1.0.0',
    description: 'Reduces distractions with a calmer panel layout and notification controls.',
    author: 'YanagiKH',
    category: 'utility',
    entry: 'focus-mode.ts',
    permissions: ['tray-control', 'ui-panel', 'settings-persistence'],
    settings: focusModeSettings.map((setting) => ({ ...setting })),
    state: 'disabled',
    installPath: 'builtin/focus-mode',
    manifestPath: 'builtin/focus-mode/plugin.json',
    source: 'built-in'
  },
  {
    id: 'quick-launcher',
    name: 'Quick Launcher',
    version: '1.0.0',
    description: 'Provides a simple shortcut panel for fast access to common actions.',
    author: 'YanagiKH',
    category: 'automation',
    entry: 'quick-launcher.ts',
    permissions: ['ui-panel', 'tray-control', 'settings-persistence', 'auto-start'],
    settings: quickLauncherSettings.map((setting) => ({ ...setting })),
    state: 'disabled',
    installPath: 'builtin/quick-launcher',
    manifestPath: 'builtin/quick-launcher/plugin.json',
    source: 'built-in'
  },
  {
    id: 'compact-sidebar',
    name: 'Compact Sidebar',
    version: '1.0.0',
    description: 'Switches between dense and spacious sidebar presets.',
    author: 'YanagiKH',
    category: 'ui',
    entry: 'compact-sidebar.ts',
    permissions: ['ui-panel', 'settings-persistence'],
    settings: compactSidebarSettings.map((setting) => ({ ...setting })),
    state: 'disabled',
    installPath: 'builtin/compact-sidebar',
    manifestPath: 'builtin/compact-sidebar/plugin.json',
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
