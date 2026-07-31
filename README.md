<div align="center">
  <picture>
    <img width="277.5" height="198" alt="Discord_Extensions" src="https://github.com/user-attachments/assets/00b0a90c-d3a9-4807-80c9-a50f5bf64897" />
  </picture>

[English](README.md) / [繁體中文](README_ZH.md) / [日本語](README_JP.md)
</div>

# Discord Extensions

Discord Extensions is a standalone desktop plugin host plus a Chromium browser companion for managing local Discord-related extensions through a control panel and a web UI helper.

This is an experimental project, and it is not an officially supported Discord plugin system. Use it at your own discretion.

## Included architecture

- Electron + TypeScript desktop UI shell with tray launch and single-instance behavior
- Chromium browser companion extension (Manifest V3) for Discord web UI tweaks and quick controls
- Shared manifest, IPC, and settings contract layer across desktop and browser components
- Built-in plugin templates plus tool-plugin manifests for TypeScript, JavaScript, Python, Go, Rust, C, and C++
- Persistent plugin state, plugin settings, and browser extension preferences storage
- Java bridge module for future native helpers and tooling
- Validation scripts and GitHub Actions workflows for desktop, browser, and sample plugin checks

## What the current repository provides

- plugin enable / disable toggles and per-plugin settings in a gear-style detail panel
- global customization controls such as language, compact layout, startup behavior, tray behavior, and font scale
- local plugin import for folders, `.zip` archives, and `plugin.json` manifests
- browser companion support for Discord web, including compact layout, sidebar width, motion reduction, and page cleanup toggles
- workspace access for installed plugins, settings files, and imported packages
- sample tool plugins written in Python, Go, Rust, C, and C++
- repository validation for desktop, browser, and sample plugin layouts

## Supported features

- desktop plugin host management
- browser companion extension for Chromium-based browsers
- built-in default plugins such as Volume Lock, Voice Comfort, Focus Mode, Quick Launcher, and Compact Sidebar
- importable external plugin packs
- persistent settings and tray startup
- multilingual UI in English, Traditional Chinese, and Japanese
- one-click launcher for non-coders

## Installation

1. Desktop host: install Node.js 24 or newer, run `npm install`, then launch with `start.bat` or `npm run start:desktop`.
2. Browser companion: open `browser-extension/` in Chrome, Edge, Brave, or another Chromium-based browser through the unpacked extension workflow.
3. Plugin packs: use the desktop control panel to import a folder, `.zip`, or `plugin.json` manifest. Tool plugins can describe Python, Go, Rust, C, or C++ runtime/build commands inside their manifests.

## Main scripts

- `npm run start:desktop`
- `npm run build`
- `npm run typecheck`
- `npm run validate:repo`
- `npm run validate:browser-extension`

## Boundary

This repository is implemented as a separate companion host and browser extension. It does not modify the Discord client installation directory or inject code into the Discord application.
