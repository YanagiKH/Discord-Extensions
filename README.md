<div align="center">
  <picture>
    <img width="277.5" height="198" alt="Discord_Extensions" src="https://github.com/user-attachments/assets/00b0a90c-d3a9-4807-80c9-a50f5bf64897" />
  </picture>

[English](README.md) / [繁體中文](README_ZH.md) / [日本語](README_JP.md)
</div>

# Discord Extensions

Discord Extensions is a standalone desktop plugin host for managing local Discord-related extensions through a control panel.

This is my experimental project, and since it’s not an officially supported plugin, you’ll have to assume all risks yourself—though, Although this possibility is very low :)

## Included architecture

- Electron + TypeScript UI shell
- Shared manifest and IPC contract layer
- Built-in volume-limiter plugin template
- Local plugin import for `.zip`, folders, and `plugin.json`
- Persistent plugin state and settings storage
- Tray-based launch and single-instance behavior
- Java bridge module for future native helpers

## What the current repository provides

- plugin enable / disable toggles
- per-plugin settings through a gear-style detail panel
- manifest scanning for imported plugins
- archive extraction into the local plugin workspace
- workspace folder access for installed plugins and state

## Main scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run typecheck`

## Boundary

This repository is implemented as a separate companion host and does not modify the Discord client installation directory or inject code into the Discord application.
