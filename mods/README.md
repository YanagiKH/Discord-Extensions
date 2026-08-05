# Extension Modules Workspace

The `mods/` directory contains source templates and is the default convention used by the desktop and Android module workbenches.

Each module should contain:

- `plugin.json`
- the entry source file declared by `entry`
- a short `README.md`
- optional build files for Java, Kotlin, or TypeScript

Do not commit secrets, tokens, private keys, compiled dependencies, or generated build directories into module packages.
