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
Discord Extensions 是一套跨平台 Discord 相關工作流程輔助工具與擴充模組宿主，提供 Electron 桌面控制面板、Chromium Manifest V3 瀏覽器擴充功能，以及以 Kotlin 與 Java 編寫的 Android 8.0+ 原生應用程式。

> [!CAUTION]
> 這是實驗性的社群專案，並非 Discord 官方支援的插件系統。本專案以獨立輔助程式運作，不會修改 Discord 安裝目錄，也不會向官方應用程式注入程式碼。

<!-- section:architecture -->
## 包含的架構

- Electron + TypeScript 桌面宿主，具備持久化設定、系統匣啟動、單一執行個體、插件匯入與獨立模組工作台視窗。
- Android 原生應用程式，Kotlin 負責 Activity 與儲存庫，Java 負責 manifest 驗證與除錯日誌儲存。
- Chromium Manifest V3 瀏覽器輔助擴充，用於 Discord 網頁版的介面調整與快速控制。
- 共用 `plugin.json` 契約，包含設定、權限、語言、runtime、build 資訊及 tool/panel 宿主模式。
- `mods/` 模組慣例與 JavaScript、TypeScript、Java、Kotlin 工作台範本。
- 現有 Python、Go、Rust、C、C++ 工具型插件範例。
- GitHub Actions 檢查 TypeScript、桌面建置、Android 單元測試、Android 8.0 模擬器啟動、瀏覽器擴充結構、模組範本與原生語言範例。
- Release 矩陣產生 Windows NSIS `.exe`、macOS `.dmg`、Linux `.AppImage`、Android `.apk` 與 Chromium `.zip`。

<!-- section:previews -->
## 介面示範

以下圖片是文件用介面預覽，不是執行時截圖。

### 桌面模組工作台

![桌面模組工作台預覽](docs/images/desktop-workbench.svg)

### Android 輔助宿主

![Android 輔助宿主預覽](docs/images/android-host.svg)

### Release 工作流程

![跨平台 Release 工作流程](docs/images/release-pipeline.svg)

<!-- section:features -->
## 支援功能

### 桌面宿主

- 啟用或停用已安裝插件。
- 從插件詳細面板修改開關、範圍、文字與選單設定。
- 匯入資料夾、`.zip` 套件或 `plugin.json` manifest。
- 將插件狀態與設定儲存在本機應用程式工作區。
- 在英文、繁體中文與日文之間切換介面。
- 設定開機啟動、隱藏啟動、系統匣、緊湊版面與字體縮放。
- 開啟插件工作區與產生的 `mods/` 目錄。

### Android 宿主

- 支援 Android 8.0 或更新版本（`minSdk 26`）。
- 透過 Android 系統文件選擇器匯入 `plugin.json` 或 `.zip` 套件。
- 將匯入檔案儲存在應用程式私有空間，不要求廣泛儲存權限。
- 安裝前以 Java 驗證模組 ID 與必要 manifest 欄位。
- 啟用或停用匯入模組並保存狀態。
- 透過系統瀏覽器開啟 Discord 網頁版。
- 顯示應用程式內部除錯日誌。
- 依裝置語言使用英文、繁體中文或日文。

### 瀏覽器輔助擴充

- 緊湊版面控制。
- 字體縮放與側欄寬度控制。
- 減少動畫模式。
- 可選擇的 Discord 網頁清理控制。
- 使用 `chrome.storage.local` 持久化設定。

### 內建與範例插件

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
## 擴充功能模組工作台

桌面版與 Android 版都包含模組工作台，用於減少建立新擴充功能時的樣板程式碼。

1. 輸入模組 ID、顯示名稱、作者、說明與分類。
2. 選擇 JavaScript、TypeScript、Java 或 Kotlin。
3. 建立模組。工作台會寫入 `plugin.json`、入口原始碼、模組 README，以及語言需要的建置檔案。
4. 開啟本機 `mods/` 目錄，或將產生的模組匯出為 `.zip` 套件。
5. 發布套件前執行對應的驗證或建置指令。

產生的套件使用以下結構：

```text
mods/my-extension/
├─ plugin.json
├─ README.md
├─ src/
│  └─ ... 入口原始碼 ...
└─ 可選的語言建置檔案
```

`plugin.json` 是相容性邊界。模組可描述 JavaScript、TypeScript、Java、Kotlin、Python、Go、Rust、C 或 C++ 原始碼，但目標裝置必須具備所需 runtime 或編譯器。Android 不會執行任意桌面原生二進位檔。

<!-- section:installation -->
## 安裝方式

### 1. GitHub Releases

開啟儲存庫最新 Release，下載目標平台檔案：

| 平台 | 套件 | 安裝方式 |
|---|---|---|
| Windows x64 | `Discord-Extensions-*.exe` | 執行 NSIS 安裝程式。 |
| macOS Intel / Apple silicon | `Discord-Extensions-*.dmg` | 開啟 DMG 並複製應用程式。 |
| Linux x64 | `Discord-Extensions-*.AppImage` | 將檔案設為可執行後啟動。 |
| Android 8.0+ | `Discord-Extensions-Android-*.apk` | 允許所選檔案來源安裝應用程式後安裝 APK。 |
| Chrome / Edge / Brave | `Discord-Extensions-Chromium.zip` | 解壓縮後以未封裝擴充功能載入。 |

Release 產物屬於社群建置。桌面套件可能未簽章；若儲存庫未設定正式簽章密鑰，Android 產物會是可安裝的 debug 簽章版本。執行前請確認檔案來自本儲存庫。

### 2. Windows 一鍵原始碼啟動器

1. 安裝 Node.js 24 或更新版本。
2. 下載或複製儲存庫。
3. 雙擊 `start.bat`。
4. 啟動器會安裝缺少的 npm 相依套件並啟動桌面宿主。

### 3. 桌面原始碼安裝

```bash
npm install
npm run typecheck
npm run validate:repo
npm run start:desktop
```

在對應作業系統建置安裝檔：

```bash
npm run dist:win
npm run dist:mac
npm run dist:linux
```

### 4. Android Studio 安裝

1. 使用 Android Studio 開啟 `android/` 目錄。
2. 選擇 JDK 17。
3. 安裝 Android SDK Platform 35 與 Build Tools 35.0.0。
4. 在 Android 8.0+ 裝置或模擬器執行 `app` 設定。

使用 Gradle 8.10.2 從命令列建置：

```bash
gradle -p android clean testDebugUnitTest assembleDebug --stacktrace
```

APK 產生位置：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Chromium 未封裝安裝

1. 開啟 `chrome://extensions`、`edge://extensions` 或對應頁面。
2. 啟用開發人員模式。
3. 選擇「載入未封裝項目」。
4. 選擇 `browser-extension/` 目錄。
5. 開啟 Discord 網頁版，使用浮動 Discord Extensions 面板或工具列彈出視窗。

### 6. 插件套件安裝

- 桌面版：使用「Import plugins」選擇資料夾、`.zip` 或 `plugin.json`。
- Android：使用「匯入插件」透過系統選擇器選擇 `.zip` 或 `plugin.json`。
- 匯入後模組預設停用，可從宿主介面啟用。

<!-- section:release -->
## Release 與驗證工作流程

- `ci.yml` 驗證桌面宿主、工作台、瀏覽器輔助擴充、Android 專案結構、Android 單元測試與原生語言範例。
- `android.yml` 建置 APK、執行單元測試、在 Android 8.0 模擬器啟動應用程式、執行儀器測試並上傳 UI/日誌證據。
- `release.yml` 在 `v*` 標籤或手動執行時啟動，建置所有支援套件，集中下載產物並發布到 GitHub Releases。

手動 Release 範例：

1. 開啟「Actions → Release → Run workflow」。
2. 輸入例如 `v0.2.0` 的標籤。
3. 等待 Windows、macOS、Linux、Android 與瀏覽器工作完成。
4. 公開宣布前檢查產生的 Release 與下載檔案。

<!-- section:debug -->
## Debug 手冊

### 桌面啟動或空白視窗問題

```bash
npm install
npm run typecheck
npm run validate:workbench
npm run build
npm run dev
```

- 檢查終端機中的 Electron 主程序與 Vite renderer 錯誤。
- 使用「Open data folder」開啟應用程式工作區。
- 暫時重新命名工作區中的 `state.json` 或 `app-settings.json`，確認是否為持久化狀態損壞。
- 確認沒有另一個執行個體占用單一執行個體鎖定。
- Linux 請確認 AppImage 可執行：`chmod +x Discord-Extensions-*.AppImage`。

### 插件匯入失敗

- 確認套件內含可讀取的 `plugin.json`。
- 必要欄位為 `id`、`name`、`version`、`description`、`author`、`entry`、`permissions`、`settings`。
- ID 使用小寫字母、數字、`.`、`_` 或 `-`。
- 確認 ZIP 路徑不會跳出套件目錄。
- 確認解壓後存在宣告的入口檔案。
- 匯入的原生語言工具需要相應 runtime 或編譯器，且不會在 Android 自動執行。

### Android 建置與執行問題

```bash
gradle -p android clean testDebugUnitTest assembleDebug --stacktrace
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -W -n io.yanagikh.discordextensions.debug/io.yanagikh.discordextensions.MainActivity
adb logcat -d '*:E'
```

- 使用 JDK 17、Gradle 8.10.2、Android Platform 35 與 Build Tools 35.0.0。
- 模擬器驗證使用 API 26 或更新版本。
- 若更新無法安裝，先移除使用不同開發簽章的版本再重新安裝。
- Android 除錯事件會顯示在應用程式內；`adb logcat` 主要用於平台崩潰。
- 應用程式刻意不要求廣泛外部儲存權限，請透過系統文件選擇器選檔。

### 瀏覽器擴充問題

```bash
npm run validate:browser-extension
```

- 修改檔案後重新載入未封裝擴充功能。
- 從瀏覽器擴充管理頁檢查 service worker。
- 確認目前分頁使用 `https://discord.com/`。
- 測試預設設定時清除擴充功能本機儲存空間。
- Discord 網頁 class 名稱可能改變，頁面清理選擇器可能需要維護。

### GitHub Actions 問題

- 開啟失敗工作，確認問題位於原始碼驗證、打包、Android Gradle、模擬器啟動或 Release 上傳。
- 重新執行前先確認相依套件或 runner 映像是否更新。
- 使用上傳的 Android 單元測試報告與模擬器證據診斷行動版問題。
- 所有打包工作成功後才會發布 Release。

<!-- section:development -->
## 主要開發指令

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
## 安全邊界

- 桌面應用程式與 Android 應用程式使用自己的本機工作區。
- 瀏覽器元件是明確的 Manifest V3 擴充功能，只具有限制於 Discord 網頁的主機權限。
- Android 匯入使用 Storage Access Framework 與應用程式私有儲存空間。
- 本專案不會修改官方 Discord 執行檔、不會修改其安裝目錄、不會繞過平台安全，也不會向官方客戶端注入程式碼。
- 啟用第三方模組前請先檢查其原始碼與權限。
