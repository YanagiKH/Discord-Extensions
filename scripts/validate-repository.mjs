import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const REQUIRED_PATHS = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'electron-builder.yml',
  'start.bat',
  'start.sh',
  'README.md',
  'README_ZH.md',
  'README_JP.md',
  'src/main.ts',
  'src/main/plugin-manager.ts',
  'src/main/workbench-manager.ts',
  'src/preload.ts',
  'src/renderer/app.ts',
  'src/renderer/index.html',
  'src/renderer/workbench.html',
  'src/renderer/workbench.ts',
  'src/renderer/workbench.css',
  'src/shared/types.ts',
  'src/shared/ipc.ts',
  'src/shared/locales.ts',
  '.editorconfig',
  '.github/CONTRIBUTING.md',
  '.github/SECURITY.md',
  '.github/workflows/ci.yml',
  '.github/workflows/android.yml',
  '.github/workflows/release.yml',
  '.github/workflows/samples.yml',
  '.github/workflows/browser-extension.yml',
  'browser-extension/manifest.json',
  'android/settings.gradle.kts',
  'android/app/build.gradle.kts',
  'android/app/src/main/AndroidManifest.xml',
  'mods/README.md',
  'mods/templates/javascript/plugin.json',
  'mods/templates/java/plugin.json',
  'mods/templates/kotlin/plugin.json',
  'docs/images/desktop-workbench.svg',
  'docs/images/android-host.svg',
  'docs/images/release-pipeline.svg',
  'scripts/collect-release-assets.mjs',
  'scripts/validate-browser-extension.mjs',
  'scripts/validate-android-project.mjs',
  'scripts/validate-workbench.mjs',
  'scripts/validate-readme-parity.mjs',
  'plugins/samples/python-voice-guard/plugin.json',
  'plugins/samples/go-quick-actions/plugin.json',
  'plugins/samples/rust-safe-speaker/plugin.json',
  'plugins/samples/c-voice-guard/plugin.json',
  'plugins/samples/cpp-compact-sidebar/plugin.json'
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
  if (!condition) throw new Error(message);
}

async function loadJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), 'utf8'));
}

async function main() {
  const missing = [];
  for (const relativePath of REQUIRED_PATHS) {
    if (!(await exists(relativePath))) missing.push(relativePath);
  }
  assert(missing.length === 0, `Missing required repository paths: ${missing.join(', ')}`);

  const pkg = await loadJson('package.json');
  const scripts = pkg.scripts ?? {};
  for (const script of [
    'start:desktop',
    'validate:repo',
    'validate:browser-extension',
    'validate:android',
    'validate:workbench',
    'validate:readmes',
    'dist:win',
    'dist:mac',
    'dist:linux'
  ]) {
    assert(typeof scripts[script] === 'string', `package.json script missing: ${script}`);
  }
  assert(pkg.devDependencies?.['electron-builder'] === '26.0.12', 'electron-builder must be pinned to 26.0.12');

  const samplePlugins = [
    'plugins/samples/python-voice-guard/plugin.json',
    'plugins/samples/go-quick-actions/plugin.json',
    'plugins/samples/rust-safe-speaker/plugin.json',
    'plugins/samples/c-voice-guard/plugin.json',
    'plugins/samples/cpp-compact-sidebar/plugin.json',
    'mods/templates/javascript/plugin.json',
    'mods/templates/java/plugin.json',
    'mods/templates/kotlin/plugin.json'
  ];

  for (const manifestPath of samplePlugins) {
    const manifest = await loadJson(manifestPath);
    for (const key of ['id', 'name', 'version', 'description', 'author', 'category', 'entry', 'permissions', 'settings']) {
      assert(Object.prototype.hasOwnProperty.call(manifest, key), `${manifestPath} missing required field: ${key}`);
    }
    assert(Array.isArray(manifest.permissions), `${manifestPath} permissions must be an array`);
    assert(Array.isArray(manifest.settings), `${manifestPath} settings must be an array`);
  }

  const browserManifest = await loadJson('browser-extension/manifest.json');
  assert(browserManifest.manifest_version === 3, 'browser-extension manifest must use MV3');
  assert(typeof browserManifest.action?.default_popup === 'string', 'browser-extension popup missing');

  const lock = await loadJson('package-lock.json');
  assert(lock.version === undefined || lock.version === pkg.version, 'package-lock package version mismatch');
  assert(lock.packages?.['']?.version === pkg.version, 'package-lock root version mismatch');
  assert(lock.packages?.['']?.devDependencies?.['electron-builder'] === '26.0.12', 'package-lock electron-builder metadata mismatch');

  const releaseWorkflow = await readFile(path.join(ROOT, '.github/workflows/release.yml'), 'utf8');
  assert(releaseWorkflow.includes('staged-release-assets/*'), 'release workflow must upload staged assets only');
  assert(!releaseWorkflow.includes('release/desktop/**'), 'release workflow must not upload unpacked desktop directories');

  console.log('Repository validation passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
