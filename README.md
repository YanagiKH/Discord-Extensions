# Discord Extensions

Discord Extensions is a desktop companion project for managing local Discord plugin modules through a standalone control panel.

## Included scaffold

- Electron + TypeScript UI shell
- Plugin registry and manifest model
- Default volume-limiter plugin template
- Plugin install flow placeholder for local `.zip` / folder imports
- Java bridge placeholder for future native helpers

## What this repository currently provides

This scaffold is designed to be extended into a modular plugin host with:

- plugin enable / disable toggles
- per-plugin settings via a gear menu
- local plugin import support
- startup integration for Windows

## Main scripts

- `npm install`
- `npm run dev`
- `npm run build`

## Note

The current scaffold focuses on the management layer and plugin architecture. Any Discord client integration should be implemented separately and in a way that respects Discord's platform rules.
