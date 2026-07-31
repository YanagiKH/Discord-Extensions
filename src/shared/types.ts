export type PluginState = 'enabled' | 'disabled';

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
  state: PluginState;
  category: 'audio' | 'ui' | 'automation' | 'integration' | 'utility';
  settings: PluginSettingField[];
}

export interface InstalledPlugin extends PluginManifest {
  installPath: string;
  source: 'built-in' | 'local-import' | 'package';
}
