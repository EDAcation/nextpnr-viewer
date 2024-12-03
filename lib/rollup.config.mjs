import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';


export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    nodeResolve(),
    typescript(),
    importMetaAssets(),
  ],
};
