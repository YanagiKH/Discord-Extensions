import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const REQUIRED_PATHS = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'start.bat',
  'src/main.ts',
  'src/main/plugin-manager.ts',
  'src/preload.ts',
  'src/renderer/app.ts',
  'src/renderer/index.html',
  'src/shared/types.ts',
  'src/shared/ipc.ts',
  'src/shared/locales.ts',
  '.editorconfig',
  '.github/CONTRIBUTING.md',
  '.github/SECURITY.md',
  '.github/workflows/ci.yml',
  '.github/workflows/samples.yml',
  '.github/workflows/browser-extension.yml',
  'browser-extension/manifest.json',
  'browser-extension/background.js',
  'browser-extension/content.js',
  'browser-extension/popup.html',
  'browser-extension/popup.js',
  'browser-extension/styles.css',
  'browser-extension/settings.js',
  'plugins/samples/python-voice-guard/plugin.json',
  'plugins/samples/python-voice-guard/main.py',
  'plugins/samples/go-quick-actions/plugin.json',
  'plugins/samples/go-quick-actions/go.mod',
  'plugins/samples/go-quick-actions/main.go',
  'plugins/samples/rust-safe-speaker/plugin.json',
  'plugins/samples/rust-safe-speaker/Cargo.toml',
  'plugins/samples/rust-safe-speaker/src/main.rs',
  'plugins/samples/c-voice-guard/plugin.json',
  'plugins/samples/c-voice-guard/main.c',
  'plugins/samples/cpp-compact-sidebar/plugin.json',
  'plugins/samples/cpp-compact-sidebar/main.cpp'
];

async function exists(relativePath) {
  try {
    await stat(path.join(ROOT, relativePath));
    return true;
  } catch {
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function loadJson(relativePath) {
  const content = await readFile(path.join(ROOT, relativePath), 'utf8');
  return JSON.parse(content);
}

async function main() {
  const missing = [];
  for (const relativePath of REQUIRED_PATHS) {
    if (!(await exists(relativePath))) {
      missing.push(relativePath);
    }
  }

  assert(missing.length === 0, `Missing required repository paths: ${missing.join(', ')}`);

  const pkg = await loadJson('package.json');
  assert(pkg.scripts && typeof pkg.scripts === 'object', 'package.json scripts object missing');
  assert(typeof pkg.scripts['validate:repo'] === 'string', 'validate:repo script missing');
  assert(typeof pkg.scripts['validate:browser-extension'] === 'string', 'validate:browser-extension script missing');
  assert(typeof pkg.scripts['start:desktop'] === 'string', 'start:desktop script missing');

  const samplePlugins = [
    'plugins/samples/python-voice-guard/plugin.json',
    'plugins/samples/go-quick-actions/plugin.json',
    'plugins/samples/rust-safe-speaker/plugin.json',
    'plugins/samples/c-voice-guard/plugin.json',
    'plugins/samples/cpp-compact-sidebar/plugin.json'
  ];

  for (const manifestPath of samplePlugins) {
    const manifest = await loadJson(manifestPath);
    for (const key of ['id', 'name', 'version', 'description', 'author', 'category', 'entry', 'permissions', 'settings']) {
      assert(Object.prototype.hasOwnProperty.call(manifest, key), `${manifestPath} missing required field: ${key}`);
    }
    assert(Array.isArray(manifest.permissions), `${manifestPath} permissions must be an array`);
    assert(Array.isArray(manifest.settings), `${manifestPath} settings must be an array`);
    assert(manifest.hostKind === 'tool', `${manifestPath} should be tool-oriented`);
    assert(typeof manifest.language === 'string', `${manifestPath} language missing`);
    assert(manifest.runtime && typeof manifest.runtime.command === 'string', `${manifestPath} runtime missing command`);
    assert(manifest.build && typeof manifest.build.command === 'string', `${manifestPath} build missing command`);
  }

  const browserManifest = await loadJson('browser-extension/manifest.json');
  assert(browserManifest.manifest_version === 3, 'browser-extension manifest must use MV3');
  assert(typeof browserManifest.action?.default_popup === 'string', 'browser-extension popup missing');
  assert(Array.isArray(browserManifest.content_scripts), 'browser-extension content scripts missing');

  console.log('Repository validation passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
