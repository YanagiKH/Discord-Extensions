export type UILocale = 'en' | 'ja' | 'zh-TW';

export interface LocaleBundle {
  locale: UILocale;
  displayName: string;
  title: string;
  subtitle: string;
  toolbar: {
    importPlugins: string;
    refresh: string;
    openDataFolder: string;
    language: string;
  };
  sections: {
    plugins: string;
    pluginDetails: string;
    globalSettings: string;
  };
  labels: {
    enabled: string;
    disabled: string;
    selectPlugin: string;
    builtIn: string;
    imported: string;
    settings: string;
    state: string;
    autoStart: string;
    startHidden: string;
    minimizeToTray: string;
    compactMode: string;
    fontScale: string;
    openWorkspace: string;
    safeDefaults: string;
    importHint: string;
  };
  status: {
    loading: string;
    loaded: string;
    refreshed: string;
    openedFolder: string;
    imported: string;
    importedWithFailures: string;
    noneSelected: string;
  };
}

const bundles: Record<UILocale, LocaleBundle> = {
  'en': {
    locale: 'en',
    displayName: 'English',
    title: 'Discord Extensions',
    subtitle: 'Plugin management, settings, and local installs',
    toolbar: {
      importPlugins: 'Import plugins',
      refresh: 'Refresh',
      openDataFolder: 'Open data folder',
      language: 'Language'
    },
    sections: {
      plugins: 'Plugin list',
      pluginDetails: 'Plugin details',
      globalSettings: 'Global customization'
    },
    labels: {
      enabled: 'Enabled',
      disabled: 'Disabled',
      selectPlugin: 'Select a plugin to edit its settings.',
      builtIn: 'Built-in',
      imported: 'Imported',
      settings: 'Settings',
      state: 'State',
      autoStart: 'Launch on system startup',
      startHidden: 'Start hidden',
      minimizeToTray: 'Minimize to tray',
      compactMode: 'Compact layout',
      fontScale: 'Font scale',
      openWorkspace: 'Open workspace',
      safeDefaults: 'Safe defaults',
      importHint: 'Import folders, zip archives, or plugin.json files.'
    },
    status: {
      loading: 'Loading plugins...',
      loaded: 'plugins loaded.',
      refreshed: 'Plugin list refreshed.',
      openedFolder: 'Workspace opened.',
      imported: 'Import completed.',
      importedWithFailures: 'Import completed with failures.',
      noneSelected: 'No plugin selected.'
    }
  },
  'ja': {
    locale: 'ja',
    displayName: '日本語',
    title: 'Discord Extensions',
    subtitle: 'プラグイン管理、設定、本機インストール',
    toolbar: {
      importPlugins: 'プラグインを読み込む',
      refresh: '更新',
      openDataFolder: 'データフォルダを開く',
      language: '言語'
    },
    sections: {
      plugins: 'プラグイン一覧',
      pluginDetails: 'プラグイン詳細',
      globalSettings: '全体設定'
    },
    labels: {
      enabled: '有効',
      disabled: '無効',
      selectPlugin: 'プラグインを選択して設定を編集します。',
      builtIn: '組み込み',
      imported: '読み込み済み',
      settings: '設定',
      state: '状態',
      autoStart: '起動時に自動起動',
      startHidden: '非表示で起動',
      minimizeToTray: 'トレイに最小化',
      compactMode: 'コンパクト表示',
      fontScale: '文字サイズ',
      openWorkspace: '作業フォルダを開く',
      safeDefaults: '安全な初期設定',
      importHint: 'フォルダ、zip、plugin.json を読み込めます。'
    },
    status: {
      loading: 'プラグインを読み込み中...',
      loaded: '個のプラグインを読み込みました。',
      refreshed: 'プラグイン一覧を更新しました。',
      openedFolder: '作業フォルダを開きました。',
      imported: '読み込みが完了しました。',
      importedWithFailures: '一部の読み込みに失敗しました。',
      noneSelected: 'プラグインが選択されていません。'
    }
  },
  'zh-TW': {
    locale: 'zh-TW',
    displayName: '繁體中文',
    title: 'Discord Extensions',
    subtitle: '插件管理、設定、本機安裝',
    toolbar: {
      importPlugins: '載入插件',
      refresh: '重新整理',
      openDataFolder: '開啟資料夾',
      language: '語言'
    },
    sections: {
      plugins: '插件清單',
      pluginDetails: '插件詳細設定',
      globalSettings: '全域自訂'
    },
    labels: {
      enabled: '啟用',
      disabled: '停用',
      selectPlugin: '選擇一個插件以編輯設定。',
      builtIn: '內建',
      imported: '已匯入',
      settings: '設定',
      state: '狀態',
      autoStart: '開機自動啟動',
      startHidden: '啟動時隱藏',
      minimizeToTray: '最小化到系統匣',
      compactMode: '緊湊版面',
      fontScale: '字體縮放',
      openWorkspace: '開啟工作資料夾',
      safeDefaults: '安全預設',
      importHint: '可匯入資料夾、zip 壓縮檔或 plugin.json。'
    },
    status: {
      loading: '正在載入插件...',
      loaded: '個插件已載入。',
      refreshed: '已重新整理插件清單。',
      openedFolder: '已開啟工作資料夾。',
      imported: '匯入完成。',
      importedWithFailures: '匯入完成，但有部分項目失敗。',
      noneSelected: '尚未選擇插件。'
    }
  }
};

export function getLocaleBundle(locale: UILocale): LocaleBundle {
  return bundles[locale] ?? bundles.en;
}

export function listLocaleOptions(): Array<{ value: UILocale; label: string }> {
  return ['en', 'ja', 'zh-TW'].map((value) => ({ value: value as UILocale, label: bundles[value as UILocale].displayName }));
}
