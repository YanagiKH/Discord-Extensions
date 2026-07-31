export const DEFAULT_SETTINGS = {
  compactMode: false,
  fontScale: 1,
  sidebarWidth: 320,
  reduceMotion: false,
  hideNitroPills: false,
  showQuickControls: true
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    compactMode: Boolean(source.compactMode ?? DEFAULT_SETTINGS.compactMode),
    fontScale: clamp(Number(source.fontScale ?? DEFAULT_SETTINGS.fontScale) || DEFAULT_SETTINGS.fontScale, 0.85, 1.4),
    sidebarWidth: clamp(Number(source.sidebarWidth ?? DEFAULT_SETTINGS.sidebarWidth) || DEFAULT_SETTINGS.sidebarWidth, 240, 420),
    reduceMotion: Boolean(source.reduceMotion ?? DEFAULT_SETTINGS.reduceMotion),
    hideNitroPills: Boolean(source.hideNitroPills ?? DEFAULT_SETTINGS.hideNitroPills),
    showQuickControls: Boolean(source.showQuickControls ?? DEFAULT_SETTINGS.showQuickControls)
  };
}
