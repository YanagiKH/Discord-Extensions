import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const required = [
  'src/main/workbench-manager.ts',
  'src/renderer/workbench.html',
  'src/renderer/workbench.ts',
  'src/renderer/workbench.css',
  'mods/README.md',
  'mods/templates/javascript/plugin.json',
  'mods/templates/java/plugin.json',
  'mods/templates/kotlin/plugin.json'
];

async function exists(relativePath) {
  try {
    await stat(path.resolve(relativePath));
    return true;
  } catch {
    return false;
  }
}

const missing = [];
for (const file of required) {
  if (!(await exists(file))) missing.push(file);
}
if (missing.length) throw new Error(`Missing workbench files: ${missing.join(', ')}`);

for (const manifestPath of required.filter((item) => item.endsWith('plugin.json'))) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!manifest.id || !manifest.language || !manifest.entry) {
    throw new Error(`Invalid workbench template manifest: ${manifestPath}`);
  }
}

const manager = await readFile('src/main/workbench-manager.ts', 'utf8');
for (const language of ['javascript', 'typescript', 'java', 'kotlin']) {
  if (!manager.includes(`language: '${language}'`)) {
    throw new Error(`Workbench template missing: ${language}`);
  }
}

console.log('Workbench validation passed.');
