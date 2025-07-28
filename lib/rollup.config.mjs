import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import chipdbMinimizer from './chipdbMinimizer.mjs';


export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    chipdbMinimizer({
      baseDir: 'static/chipdb',
      cliPath: './target/release/nextpnr-renderer',
    }),
    nodeResolve(),
    typescript(),
    importMetaAssets(),
  ],
};
