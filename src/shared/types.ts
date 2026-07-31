export type PluginState = 'enabled' | 'disabled';
export type PluginCategory = 'audio' | 'ui' | 'automation' | 'integration' | 'utility';
export type PluginSource = 'built-in' | 'local-import' | 'package';
export type PluginPermission =
  | 'voice-volume-read'
  | 'voice-volume-normalize'
  | 'tray-control'
  | 'file-import'
  | 'ui-panel'
  | 'settings-persistence'
  | 'auto-start';

export interface PluginSettingField {
  key: string;
  label: string;
  type: 'toggle' | 'range' | 'text' | 'select';
  value: string | number | boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  entry: string;
  permissions: PluginPermission[];
  settings: PluginSettingField[];
}

export interface InstalledPlugin extends PluginManifest {
  state: PluginState;
  installPath: string;
  manifestPath: string;
  source: PluginSource;
}

export interface PluginStoreRecord {
  enabled: boolean;
  settings: Record<string, string | number | boolean>;
}

export interface PluginImportFailure {
  sourcePath: string;
  reason: string;
}

export interface PluginImportResult {
  installed: InstalledPlugin[];
  failed: PluginImportFailure[];
}
