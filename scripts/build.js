import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { compileSassAndPurgeCss } from '@depasquale/front-end-build-tools';

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(thisDir, '../src');
const buildDir = path.join(thisDir, '../build');

const startTime = Date.now();

// Delete files in /build directory first to avoid accumulation of old files whose parents have been renamed
await fs.emptyDir(path.join(buildDir));
await fs.ensureDir(path.join(buildDir, '/css'));

const tsFinished = new Promise((resolve) => {
  const tsProcess = spawn('tsc', [], { stdio: 'inherit', cwd: srcDir });
  tsProcess.on('close', (code) => {
    console.log(`TypeScript compile process exited with code ${code}`);
    resolve();
  });
});

// CSS
await tsFinished;
const cssFinished = compileSassAndPurgeCss({
  srcSassPath: path.join(srcDir, 'sass/three-immersive-controls.scss'),
  destCssPath: path.join(buildDir, 'css/three-immersive-controls.css'),
  purgeCssContent: [
    path.join(buildDir, 'modules/controls/VRControls.js'),
    path.join(buildDir, 'ImmersiveControls.js'),
    path.join(buildDir, 'modules/rounded-rectangle.js'), // For some reason, this needs to be included in order for "Enter VR" button to be displayed properly
  ],
  cssFilesToPurge: [path.join(buildDir, 'css/three-immersive-controls.css')],
});

await cssFinished;
const endTime = Date.now();
const duration = endTime - startTime;
console.log(`Build took ${duration} milliseconds`);
