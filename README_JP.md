<div align="center">
  <picture>
    <img width="277.5" height="198" alt="Discord_Extensions" src="https://github.com/user-attachments/assets/00b0a90c-d3a9-4807-80c9-a50f5bf64897" />
  </picture>

[English](README.md) / [繁體中文](README_ZH.md) / [日本語](README_JP.md)
</div>

# Discord Extensions

Discord Extensions は、ローカルの Discord 関連拡張機能を管理するためのスタンドアロンデスクトッププラグインホストであり、Chromium ブラウザ向けの拡張機能コンパニオンも提供します。コントロールパネルと Web UI 補助ツールの両方から操作できます。

これは実験的なプロジェクトであり、Discord の公式サポート対象ではないプラグインシステムです。利用は自己責任でお願いします。

## 採用しているアーキテクチャ

- システムトレイ起動とシングルインスタンス動作を備えた Electron + TypeScript のデスクトップ UI シェル
- Discord Web UI の調整やクイック操作のための Chromium ブラウザ拡張機能（Manifest V3）
- デスクトップ側とブラウザ側で共有する manifest、IPC、設定の契約レイヤー
- 組み込みプラグインテンプレートと、TypeScript、JavaScript、Python、Go、Rust、C、C++ に対応したツール型プラグイン manifest
- プラグイン状態、プラグイン設定、ブラウザ拡張設定の永続保存
- 将来のネイティブ補助ツールや拡張処理向けの Java ブリッジモジュール
- デスクトップ、ブラウザ、サンプルプラグインを検証するための検証スクリプトと GitHub Actions ワークフロー

## 現在のリポジトリが提供する機能

- プラグインの有効化／無効化切り替えと、歯車型詳細パネルからの個別設定
- 言語、コンパクトレイアウト、起動動作、トレイ動作、文字サイズなどの全体カスタマイズ
- フォルダ、`.zip` アーカイブ、`plugin.json` manifest からのローカルプラグイン取り込み
- Discord Web 向けのブラウザ拡張サポート。コンパクトレイアウト、サイドバー幅、動作軽減、ページ整理の切り替えを含みます
- インストール済みプラグイン、設定ファイル、取り込み済みパッケージへのワークスペースアクセス
- Python、Go、Rust、C、C++ で書かれたツール型プラグインのサンプル
- デスクトップ、ブラウザ、サンプルプラグインのレイアウト検証

## 対応機能

- デスクトッププラグインホスト管理
- Chromium 系ブラウザ向けのブラウザ拡張機能
- Volume Lock、Voice Comfort、Focus Mode、Quick Launcher、Compact Sidebar などの組み込み既定プラグイン
- 取り込み可能な外部プラグインパック
- 永続化設定とトレイ起動
- 英語、繁體中文、日本語の 3 言語 UI
- コードに不慣れな利用者向けのワンクリック起動

## インストール方法

1. デスクトップホスト: Node.js 24 以上をインストールし、`npm install` を実行してから `start.bat` または `npm run start:desktop` で起動します。
2. ブラウザ拡張: Chrome、Edge、Brave、または他の Chromium 系ブラウザで、`browser-extension/` を「パッケージ化されていない拡張機能を読み込む」方法で追加します。
3. プラグインパック: デスクトップのコントロールパネルからフォルダ、`.zip`、または `plugin.json` manifest を取り込みます。ツール型プラグインは manifest 内に Python、Go、Rust、C、C++ の runtime/build コマンドを記述できます。

## 主なスクリプト

- `npm run start:desktop`
- `npm run build`
- `npm run typecheck`
- `npm run validate:repo`
- `npm run validate:browser-extension`

## 境界

このリポジトリは独立したコンパニオンホストおよびブラウザ拡張機能として実装されており、Discord クライアントのインストールディレクトリを変更したり、Discord アプリケーションにコードを注入したりすることはありません。
