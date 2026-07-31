package io.yanagikh.extensions;

public final class VolumeLockProfile {
    private final int targetVolume;
    private final boolean autoNormalize;
    private final boolean showBadge;

    public VolumeLockProfile(int targetVolume, boolean autoNormalize, boolean showBadge) {
        this.targetVolume = clamp(targetVolume);
        this.autoNormalize = autoNormalize;
        this.showBadge = showBadge;
    }

    public int getTargetVolume() {
        return targetVolume;
    }

    public boolean isAutoNormalize() {
        return autoNormalize;
    }

    public boolean isShowBadge() {
        return showBadge;
    }

    public int normalize(int incomingVolume) {
        int input = clamp(incomingVolume);
        if (!autoNormalize) {
            return targetVolume;
        }
        return clamp(Math.round((input + targetVolume) / 2.0f));
    }

    private static int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }
}
