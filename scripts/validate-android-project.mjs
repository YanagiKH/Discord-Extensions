import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const required = [
  'android/settings.gradle.kts',
  'android/build.gradle.kts',
  'android/gradle.properties',
  'android/app/build.gradle.kts',
  'android/app/src/main/AndroidManifest.xml',
  'android/app/src/main/java/io/yanagikh/discordextensions/MainActivity.kt',
  'android/app/src/main/java/io/yanagikh/discordextensions/WorkbenchActivity.kt',
  'android/app/src/main/java/io/yanagikh/discordextensions/PluginRepository.kt',
  'android/app/src/main/java/io/yanagikh/discordextensions/PluginManifestValidator.java',
  'android/app/src/main/java/io/yanagikh/discordextensions/DebugLogStore.java',
  'android/app/src/test/java/io/yanagikh/discordextensions/PluginManifestValidatorTest.java',
  'android/app/src/androidTest/java/io/yanagikh/discordextensions/MainActivitySmokeTest.kt'
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
if (missing.length) throw new Error(`Missing Android files: ${missing.join(', ')}`);

const build = await readFile('android/app/build.gradle.kts', 'utf8');
if (!build.includes('minSdk = 26')) throw new Error('Android minSdk must remain 26.');
if (!build.includes('targetSdk = 35')) throw new Error('Android targetSdk must remain 35.');
if (!build.includes('JavaVersion.VERSION_17')) throw new Error('Android Java 17 toolchain missing.');

const manifest = await readFile('android/app/src/main/AndroidManifest.xml', 'utf8');
for (const forbidden of ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'MANAGE_EXTERNAL_STORAGE']) {
  if (manifest.includes(forbidden)) throw new Error(`Forbidden broad storage permission: ${forbidden}`);
}

console.log('Android project validation passed.');
