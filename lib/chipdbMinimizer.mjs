// chipdbMinimizer.js
import { spawnSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export default function chipdbMinimizer(options = {}) {
  const chipdbBaseDir = options.baseDir || 'static/chipdb';
  const outputSuffix = options.outputSuffix || '-min.bin';
  const archList = ['ecp5', 'ice40'];

  return {
    name: 'chipdb-minimizer',

    async buildStart() {
      for (const arch of archList) {
        const archDir = path.join(chipdbBaseDir, arch);
        const entries = await fs.readdir(archDir);

        for (const entry of entries) {
          if (!entry.endsWith('.bin') || entry.endsWith(outputSuffix)) continue;

          const inputPath = path.join(archDir, entry);
          const outputPath = path.join(archDir, entry.replace(/\.bin$/, outputSuffix));

          console.log(`Minimizing ${inputPath} -> ${outputPath}`);
          const result = spawnSync(
            options.cliPath || './target/debug/nextpnr-renderer',
            ['--arch', arch, '--input', inputPath, '--output', outputPath],
            { stdio: 'inherit' }
          );

          if (result.status !== 0) {
            this.error(`chipdb_minimizer failed on ${inputPath}`);
          }
        }
      }
    },
  };
}
