import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const REQUIRED_PATHS = [
  'browser-extension/manifest.json',
  'browser-extension/background.js',
  'browser-extension/content.js',
  'browser-extension/popup.html',
  'browser-extension/popup.js',
  'browser-extension/styles.css',
  'browser-extension/settings.js'
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function exists(relativePath) {
  try {
    await stat(path.join(ROOT, relativePath));
    return true;
  } catch {
    return false;
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

  assert(missing.length === 0, `Missing browser extension paths: ${missing.join(', ')}`);

  const manifest = await loadJson('browser-extension/manifest.json');
  assert(manifest.manifest_version === 3, 'Browser extension must use Manifest V3');
  assert(typeof manifest.name === 'string' && manifest.name.length > 0, 'Manifest name missing');
  assert(typeof manifest.action?.default_popup === 'string', 'Popup must be defined');
  assert(Array.isArray(manifest.content_scripts) && manifest.content_scripts.length > 0, 'Content scripts missing');
  assert(Array.isArray(manifest.permissions), 'Permissions must be an array');
  assert(Array.isArray(manifest.host_permissions), 'Host permissions must be an array');

  console.log('Browser extension validation passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
