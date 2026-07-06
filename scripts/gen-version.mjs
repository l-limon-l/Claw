// Generates latest.json from the built artifacts.
// Run AFTER the final Claw.exe exists (and after signing, if you sign it),
// because the loader compares the SHA-256 of the exact released exe.
//
//   npm run release      # builds index.js + Claw.exe
//   npm run gen:version  # writes latest.json from those artifacts
//
// Then commit latest.json and upload the same Claw.exe to the GitHub release.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const exePath = 'loader-csharp/bin/Release/net48/Claw.exe';

if (!existsSync('index.js')) {
  console.error('index.js not found. Run `npm run build` first.');
  process.exit(1);
}
if (!existsSync(exePath)) {
  console.error(`${exePath} not found. Run \`npm run build:loader\` first.`);
  process.exit(1);
}

const manifest = {
  version: pkg.version,
  payloadSha256: sha256('index.js'),
  loaderSha256: sha256(exePath),
  releaseUrl: 'https://github.com/l-limon-l/Claw/releases/tag/Main'
};

writeFileSync('latest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('Wrote latest.json:');
console.log(JSON.stringify(manifest, null, 2));
