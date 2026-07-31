# Discord Extensions

Discord Extensions is a standalone desktop plugin host for managing local Discord-related extensions through a control panel.

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
