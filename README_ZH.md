<div align="center">
  <picture>
    <img width="277.5" height="198" alt="Discord_Extensions" src="https://github.com/user-attachments/assets/00b0a90c-d3a9-4807-80c9-a50f5bf64897" />
  </picture>

[English](README.md) / [繁體中文](README_ZH.md) / [日本語](README_JP.md)
</div>

# Discord 擴充功能

Discord 擴充功能是一個獨立的桌面外掛程式主機，可透過控制面板管理本機的 Discord 相關擴充功能。

這是我的實驗品，加上不是官方認可的插件工具，所以要自己承擔任何風險，雖然可能性不大:)

## 包含的架構

- Electron + TypeScript 介面外殼
- 共用清單與 IPC 協定層
- 內建音量限制器擴充插件範本
- 支援從 `.zip`、資料夾及 `plugin.json` 匯入本機擴充插件
- 持久化外掛程式狀態與設定儲存
- 透過系統托盤啟動及單一執行個體行為
- 供未來原生輔助程式使用的 Java 橋接模組

## 當前儲存庫提供的功能

- 擴充插件啟用／停用切換鈕
- 透過齒輪圖示風格的詳細資訊面板進行單一擴充插件設定
- 掃描已匯入擴充插件的清單檔案
- 將壓縮檔解壓縮至本機擴充插件工作區
- 存取已安裝擴充插件及其狀態的工作區資料夾

## 主要指令檔

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run typecheck`

## 邊界說明

此儲存庫以獨立的輔助主機形式實作，不會修改 Discord 客戶端安裝目錄，也不會將程式碼注入 Discord 應用程式中。
