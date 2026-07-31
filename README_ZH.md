<div align="center">
  <picture>
    <img width="277.5" height="198" alt="Discord_Extensions" src="https://github.com/user-attachments/assets/00b0a90c-d3a9-4807-80c9-a50f5bf64897" />
  </picture>

[English](README.md) / [繁體中文](README_ZH.md) / [日本語](README_JP.md)
</div>

# Discord Extensions

Discord Extensions 是一個獨立的桌面插件主機，另外也提供 Chromium 瀏覽器擴充功能，可透過控制面板與網頁介面輔助工具管理本機的 Discord 相關擴充內容。

> [!CAUTION]
> 這是一個實驗性專案，並非官方支援的 Discord 插件系統，請自行評估風險後使用。

## 包含的架構

- Electron + TypeScript 桌面介面外殼，支援系統匣啟動與單一執行個體行為
- Chromium 瀏覽器擴充功能（Manifest V3），用於 Discord 網頁版的介面調整與快速控制
- 桌面端與瀏覽器端共用的 manifest、IPC、設定契約層
- 內建插件範本，以及支援 TypeScript、JavaScript、Python、Go、Rust、C、C++ 的工具型插件 manifest
- 持久化的插件狀態、插件設定與瀏覽器擴充偏好儲存
- 供未來原生輔助工具與擴充流程使用的 Java 橋接模組
- 用於桌面端、瀏覽器端與樣本插件檢查的驗證腳本與 GitHub Actions 工作流程

## 當前儲存庫提供的功能

- 插件啟用／停用切換與透過齒輪式詳細面板進行單一插件設定
- 全域自訂功能，例如語言、緊湊版面、啟動行為、系統匣行為與字體縮放
- 可從資料夾、`.zip` 壓縮檔與 `plugin.json` manifest 匯入本機插件
- 瀏覽器端對 Discord 網頁版的支援，包括緊湊版面、側欄寬度、動作減少與頁面清理切換
- 已安裝插件、設定檔與匯入套件的工作區存取
- 以 Python、Go、Rust、C、C++ 撰寫的工具型插件樣本
- 桌面端、瀏覽器端與樣本插件版型的儲存庫驗證

## 支援的功能

- 桌面插件主機管理
- 適用於 Chromium 系瀏覽器的瀏覽器擴充功能
- 內建預設插件，例如 Volume Lock、Voice Comfort、Focus Mode、Quick Launcher、Compact Sidebar
- 可匯入的外部插件套件
- 持久化設定與系統匣啟動
- 英文、繁體中文、日文三語系介面
- 供不熟悉程式碼的使用者直接上手的一鍵啟動器

## 安裝方式

1. 桌面主機：安裝 Node.js 24 或更新版本，執行 `npm install`，再用 `start.bat` 或 `npm run start:desktop` 啟動。
2. 瀏覽器擴充：在 Chrome、Edge、Brave 或其他 Chromium 系瀏覽器中，透過「載入未封裝項目」方式載入 `browser-extension/`。
3. 插件套件：使用桌面控制面板匯入資料夾、`.zip` 或 `plugin.json` manifest。工具型插件可在 manifest 內描述 Python、Go、Rust、C 或 C++ 的 runtime/build 指令。

## 主要指令

- `npm run start:desktop`
- `npm run build`
- `npm run typecheck`
- `npm run validate:repo`
- `npm run validate:browser-extension`

> [!NOTE]
> 此儲存庫以獨立的輔助主機與瀏覽器擴充功能形式實作，不會修改 Discord 客戶端安裝目錄，也不會將程式碼注入 Discord 應用程式中。
