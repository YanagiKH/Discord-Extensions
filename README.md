<div align="center">
  <picture>
    <img width="277.5" height="198" alt="Discord Extensions" src="https://github.com/user-attachments/assets/00b0a90c-d3a9-4807-80c9-a50f5bf64897" />
  </picture>

[English](README.md) / [繁體中文](README_ZH.md) / [日本語](README_JP.md)

[![CI](https://github.com/YanagiKH/Discord-Extensions/actions/workflows/ci.yml/badge.svg)](https://github.com/YanagiKH/Discord-Extensions/actions/workflows/ci.yml)
[![Android](https://github.com/YanagiKH/Discord-Extensions/actions/workflows/android.yml/badge.svg)](https://github.com/YanagiKH/Discord-Extensions/actions/workflows/android.yml)
</div>

# Discord Extensions

<!-- section:overview -->
Discord Extensions is a cross-platform companion and extension-module host for Discord-related workflows. It provides an Electron desktop control panel, a Chromium Manifest V3 companion, and a native Android 8.0+ application written in Kotlin and Java.

> [!CAUTION]
> This is an experimental community project and is not an officially supported Discord plugin system. The project runs as a separate companion and does not modify the Discord installation directory or inject code into the official application.

<!-- section:architecture -->
## Included architecture

- Electron + TypeScript desktop host with persistent settings, tray launch, single-instance behavior, plugin import, and a separate module workbench window.
- Native Android application using Kotlin for activities/repositories and Java for manifest validation and debug-log storage.
- Chromium Manifest V3 browser companion for Discord web interface adjustments and quick controls.
- Shared `plugin.json` contract with settings, permissions, language, runtime, build metadata, and tool/panel host modes.
- `mods/` module convention and JavaScript, TypeScript, Java, and Kotlin workbench templates.
- Existing Python, Go, Rust, C, and C++ tool-plugin examples.
- GitHub Actions checks for TypeScript, desktop builds, Android unit tests, Android 8.0 emulator startup, browser-extension structure, module templates, and native-language samples.
- Release matrix for Windows NSIS `.exe`, macOS `.dmg`, Linux `.AppImage`, Android `.apk`, and Chromium `.zip` packages.

<!-- section:previews -->
## Interface previews

The following images are documentation previews rather than captured runtime screenshots.

### Desktop module workbench

![Desktop module workbench preview](docs/images/desktop-workbench.svg)

### Android companion host

![Android companion host preview](docs/images/android-host.svg)

### Release pipeline

![Cross-platform release pipeline](docs/images/release-pipeline.svg)

<!-- section:features -->
## Supported features

### Desktop host

- Enable or disable installed plugins.
- Edit toggle, range, text, and select settings from a plugin detail panel.
- Import folders, `.zip` packages, or `plugin.json` manifests.
- Store plugin state and settings in the local application workspace.
- Switch the interface between English, Traditional Chinese, and Japanese.
- Configure startup, hidden launch, tray behavior, compact layout, and font scale.
- Open the plugin workspace and generated `mods/` directory.

### Android host

- Android 8.0 or newer (`minSdk 26`).
- Import `plugin.json` or `.zip` packages through Android's system document picker.
- Store imported files in application-private storage without broad storage permissions.
- Validate module IDs and required manifest fields in Java before installation.
- Enable or disable imported modules and preserve their state.
- Open Discord web through the system browser.
- Display an application-local debug log.
- Use English, Traditional Chinese, or Japanese according to the device language.

### Browser companion

- Compact-layout control.
- Font-scale and sidebar-width controls.
- Reduced-motion mode.
- Optional Discord web page-cleanup controls.
- Persistent settings through `chrome.storage.local`.

### Built-in and sample plugins

- Volume Lock
- Voice Comfort
- Focus Mode
- Quick Launcher
- Compact Sidebar
- Python Voice Guard
- Go Quick Actions
- Rust Safe Speaker
- C Voice Guard
- C++ Compact Sidebar

<!-- section:workbench -->
## Extension Module Workbench

The desktop and Android applications include a module workbench intended to reduce the amount of boilerplate required for new extensions.

1. Enter a module ID, display name, author, description, and category.
2. Select JavaScript, TypeScript, Java, or Kotlin.
3. Create the module. The workbench writes `plugin.json`, the entry source file, a module README, and language-specific build files when required.
4. Open the local `mods/` directory or export the generated module as a `.zip` package.
5. Run the relevant validation/build command before distributing the package.

A generated package follows this layout:

```text
mods/my-extension/
├─ plugin.json
├─ README.md
├─ src/
│  └─ ... entry source ...
└─ optional language build files
```

`plugin.json` is the compatibility boundary. A module may describe source written in JavaScript, TypeScript, Java, Kotlin, Python, Go, Rust, C, or C++, but the required runtime/compiler must exist on the target device. Android does not execute arbitrary desktop binaries.

<!-- section:installation -->
## Installation methods

### 1. GitHub Releases

Open the latest repository Release and download the file for the target platform:

| Platform | Package | Installation |
|---|---|---|
| Windows x64 | `Discord-Extensions-*.exe` | Run the NSIS installer. |
| macOS Intel / Apple silicon | `Discord-Extensions-*.dmg` | Open the DMG and copy the application. |
| Linux x64 | `Discord-Extensions-*.AppImage` | Mark the file executable and run it. |
| Android 8.0+ | `Discord-Extensions-Android-*.apk` | Allow installation from the selected file source, then install the APK. |
| Chrome / Edge / Brave | `Discord-Extensions-Chromium.zip` | Extract it and load the folder as an unpacked extension. |

Release artifacts are community builds. Desktop packages may be unsigned, and the Android artifact is an installable debug-signed build unless repository signing secrets are configured. Verify that the file came from this repository before running it.

### 2. Windows one-click source launcher

1. Install Node.js 24 or newer.
2. Download or clone the repository.
3. Double-click `start.bat`.
4. The launcher installs missing npm dependencies and starts the desktop host.

### 3. Desktop source installation

```bash
npm install
npm run typecheck
npm run validate:repo
npm run start:desktop
```

Build an installer on the matching operating system:

```bash
npm run dist:win
npm run dist:mac
npm run dist:linux
```

### 4. Android Studio installation

1. Open the `android/` directory in Android Studio.
2. Select JDK 17.
3. Install Android SDK Platform 35 and Build Tools 35.0.0.
4. Run the `app` configuration on an Android 8.0+ device or emulator.

Command-line build with Gradle 8.10.2:

```bash
gradle -p android clean testDebugUnitTest assembleDebug --stacktrace
```

The APK is created at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Chromium unpacked installation

1. Open `chrome://extensions`, `edge://extensions`, or the equivalent page.
2. Enable Developer mode.
3. Select **Load unpacked**.
4. Choose the `browser-extension/` directory.
5. Open Discord web and use the floating Discord Extensions panel or toolbar popup.

### 6. Plugin-package installation

- Desktop: use **Import plugins** and select a directory, `.zip`, or `plugin.json`.
- Android: use **Import plugin** and select a `.zip` or `plugin.json` through the system picker.
- Modules are disabled by default after import and can be enabled from the host interface.

<!-- section:release -->
## Release and validation workflow

- `ci.yml` validates the desktop host, workbench, browser companion, Android project structure, Android unit tests, and native-language examples.
- `android.yml` builds an APK, runs unit tests, starts the app on an Android 8.0 emulator, runs instrumentation tests, and uploads UI/log evidence.
- `release.yml` runs on `v*` tags or manual dispatch, builds every supported package, downloads the artifacts into one release job, and publishes them to GitHub Releases.

Manual release example:

1. Open **Actions → Release → Run workflow**.
2. Enter a tag such as `v0.2.0`.
3. Wait for Windows, macOS, Linux, Android, and browser jobs to complete.
4. Inspect the generated Release and downloaded artifacts before announcing it.

<!-- section:debug -->
## Debug manual

### Desktop startup or blank-window problems

```bash
npm install
npm run typecheck
npm run validate:workbench
npm run build
npm run dev
```

- Check the terminal for Electron main-process and Vite renderer errors.
- Open the application workspace with **Open data folder**.
- Temporarily rename the workspace `state.json` or `app-settings.json` to determine whether persisted state is invalid.
- Check whether another running instance is holding the single-instance lock.
- On Linux, confirm that the AppImage is executable: `chmod +x Discord-Extensions-*.AppImage`.

### Plugin import failures

- Confirm that the package contains a readable `plugin.json`.
- Required fields are `id`, `name`, `version`, `description`, `author`, `entry`, `permissions`, and `settings`.
- Use a lowercase ID containing only letters, numbers, `.`, `_`, or `-`.
- Ensure ZIP paths do not escape the package directory.
- Confirm that the declared entry file exists after extraction.
- Imported native-language tools require their runtime/compiler and do not execute automatically on Android.

### Android build and runtime problems

```bash
gradle -p android clean testDebugUnitTest assembleDebug --stacktrace
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -W -n io.yanagikh.discordextensions.debug/io.yanagikh.discordextensions.MainActivity
adb logcat -d '*:E'
```

- Use JDK 17, Gradle 8.10.2, Android Platform 35, and Build Tools 35.0.0.
- For emulator validation, use API 26 or newer.
- If an update cannot be installed, uninstall a build signed with a different development key before reinstalling.
- Android debug events are shown inside the app. `adb logcat` is mainly used for platform crashes.
- The app intentionally requests no broad external-storage permission; choose files through the system picker.

### Browser-extension problems

```bash
npm run validate:browser-extension
```

- Reload the unpacked extension after editing files.
- Inspect the extension service worker from the browser extension-management page.
- Confirm that the active tab uses `https://discord.com/`.
- Clear the extension's local storage when testing default settings.
- Discord web class names can change; page-cleanup selectors may require maintenance.

### GitHub Actions problems

- Open the failed job and identify whether the failure occurred in source validation, packaging, Android Gradle, emulator startup, or release upload.
- Re-run a failed job only after checking whether a dependency or runner image changed.
- Use the uploaded Android unit-test reports and emulator evidence when diagnosing mobile failures.
- A release is published only after every packaging job succeeds.

<!-- section:development -->
## Main development commands

```bash
npm run start:desktop
npm run build
npm run typecheck
npm run validate:repo
npm run validate:workbench
npm run validate:browser-extension
npm run validate:android
```

<!-- section:security -->
## Security boundary

- The desktop application and Android application use their own local workspace.
- The browser component is an explicit Manifest V3 extension with limited Discord web host permissions.
- Android imports use the Storage Access Framework and application-private storage.
- The project does not patch the official Discord executable, modify its installation directory, bypass platform security, or inject code into the official client.
- Review third-party module source and permissions before enabling it.
