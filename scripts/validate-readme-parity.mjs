import { readFile } from 'node:fs/promises';

const files = ['README.md', 'README_ZH.md', 'README_JP.md'];
const markerPattern = /<!-- section:([a-z-]+) -->/g;

function extractMarkers(content) {
  return [...content.matchAll(markerPattern)].map((match) => match[1]);
}

const contents = await Promise.all(files.map((file) => readFile(file, 'utf8')));
const markerSets = contents.map(extractMarkers);
const expected = JSON.stringify(markerSets[0]);

for (let index = 0; index < markerSets.length; index += 1) {
  if (JSON.stringify(markerSets[index]) !== expected) {
    throw new Error(`${files[index]} does not match the shared README section structure.`);
  }
}

for (const [index, content] of contents.entries()) {
  for (const image of ['desktop-workbench.svg', 'android-host.svg', 'release-pipeline.svg']) {
    if (!content.includes(image)) throw new Error(`${files[index]} is missing image ${image}.`);
  }
  for (const command of ['validate:workbench', 'validate:android', 'validate:browser-extension']) {
    if (!content.includes(command)) throw new Error(`${files[index]} is missing command ${command}.`);
  }
}

console.log('Multilingual README parity validation passed.');
