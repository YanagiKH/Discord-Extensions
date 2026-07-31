export interface VolumeLockConfig {
  targetVolume: number;
  autoNormalize: boolean;
  showBadge: boolean;
}

export const defaultVolumeLockConfig: VolumeLockConfig = {
  targetVolume: 70,
  autoNormalize: true,
  showBadge: true
};

export function normalizeVolume(inputVolume: number, config: VolumeLockConfig = defaultVolumeLockConfig): number {
  const clampedInput = Math.max(0, Math.min(100, inputVolume));
  if (!config.autoNormalize) {
    return Math.max(0, Math.min(100, config.targetVolume));
  }

  const base = config.targetVolume;
  const adjusted = Math.round((clampedInput + base) / 2);
  return Math.max(0, Math.min(100, adjusted));
}

export function summarizeVolumeChange(userLabel: string, volume: number): string {
  return `${userLabel} volume normalized to ${Math.round(volume)}%`;
}
