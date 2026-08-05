import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const mode = process.argv[2];
const platform = process.argv[3];
const root = process.cwd();
const outputRoot = path.join(root, 'staged-release-assets');
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = String(packageJson.version ?? '').trim();

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Invalid package version: ${version || '(empty)'}`);
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function copyMatching(sourceRoot, predicate) {
  const sourceStat = await stat(sourceRoot).catch(() => null);
  if (!sourceStat?.isDirectory()) {
    throw new Error(`Release output directory does not exist: ${sourceRoot}`);
  }

  const matches = (await walk(sourceRoot)).filter(predicate);
  if (matches.length === 0) {
    throw new Error(`No installable release assets found in ${sourceRoot}`);
  }

  const names = new Set();
  for (const source of matches) {
    const name = path.basename(source);
    if (names.has(name)) {
      throw new Error(`Duplicate staged asset name: ${name}`);
    }
    names.add(name);
    await cp(source, path.join(outputRoot, name));
  }
  return matches.length;
}

if (mode === 'desktop') {
  const extensions = {
    windows: ['.exe'],
    macos: ['.dmg'],
    linux: ['.AppImage']
  }[platform];

  if (!extensions) {
    throw new Error(`Unsupported desktop platform: ${platform ?? '(missing)'}`);
  }

  const count = await copyMatching(
    path.join(root, 'release', 'desktop'),
    (file) => extensions.some((extension) => file.endsWith(extension))
  );
  console.log(`Staged ${count} ${platform} desktop installer(s).`);
} else if (mode === 'android') {
  const source = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const sourceStat = await stat(source).catch(() => null);
  if (!sourceStat?.isFile()) {
    throw new Error(`Android APK was not produced: ${source}`);
  }
  const target = path.join(outputRoot, `Discord-Extensions-${version}-android.apk`);
  await cp(source, target);
  console.log(`Staged ${path.basename(target)}.`);
} else if (mode === 'browser') {
  const target = path.join(outputRoot, `Discord-Extensions-${version}-chromium.zip`);
  const result = spawnSync('zip', ['-q', '-r', target, 'browser-extension'], {
    cwd: root,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    throw new Error(`Browser extension packaging failed: ${result.stderr || result.stdout}`);
  }
  const targetStat = await stat(target).catch(() => null);
  if (!targetStat?.isFile() || targetStat.size === 0) {
    throw new Error('Browser extension ZIP was not produced.');
  }
  console.log(`Staged ${path.basename(target)}.`);
} else {
  throw new Error(`Unknown release collection mode: ${mode ?? '(missing)'}`);
}
