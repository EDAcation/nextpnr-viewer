import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [
    nodeResolve(),
    typescript({
      target: 'es2021',
    }),
    importMetaAssets(),
    commonjs(),
    serve({
      contentBase: ['.', 'dist'],
    }),
  ],
};
