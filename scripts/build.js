import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { compileSassAndPurgeCss } from '@depasquale/front-end-build-tools';
import esbuild from 'esbuild';

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(thisDir, '../src');
const buildDir = path.join(thisDir, '../build');

const startTime = Date.now();

// Delete files in /build directory first to avoid accumulation of old files whose parents have been renamed
await fs.emptyDir(path.join(buildDir));
await fs.ensureDir(path.join(buildDir, '/css'));

await new Promise((resolve) => {
  const tsProcess = spawn('tsc', [], { stdio: 'inherit', cwd: srcDir });
  tsProcess.on('close', (code) => {
    console.log(`TypeScript compile process exited with code ${code}`);
    resolve();
  });
});

await esbuild.build({
  entryPoints: [path.join(buildDir, '/temp/ImmersiveControls.js')],
  bundle: true,
  format: 'esm',
  external: [
    'three',
    '@tweenjs/tween.js',
    '@depasquale/three-stats-mesh',
  ],
  outfile: path.join(buildDir, '/three-immersive-controls.js'),
})
  .then(() => {
    fs.remove(path.join(buildDir, '/temp'), (err) => {
      if (err) console.error(err);
    });
    console.log('esbuild process complete');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// CSS
await compileSassAndPurgeCss({
  srcSassPath: path.join(srcDir, 'sass/three-immersive-controls.scss'),
  destCssPath: path.join(buildDir, 'css/three-immersive-controls.css'),
  purgeCssContent: [
    path.join(buildDir, '/three-immersive-controls.js'),
  ],
  cssFilesToPurge: [path.join(buildDir, 'css/three-immersive-controls.css')],
});

const endTime = Date.now();
const duration = endTime - startTime;
console.log(`Build took ${duration} milliseconds`);
