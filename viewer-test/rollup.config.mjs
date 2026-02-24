import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import serve from 'rollup-plugin-serve';

export default {
  input: 'index.html',
  output: {
    dir: 'dist',
    format: 'es'
  },
  plugins: [
    nodeResolve(),
    typescript({
      target: 'es2021',
    }),
    importMetaAssets(),
    commonjs(),
    html(),
    process.env.ROLLUP_WATCH && serve({
      contentBase: ['dist'],
    }),
  ],
};
