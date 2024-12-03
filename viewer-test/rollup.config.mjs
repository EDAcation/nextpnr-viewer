import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

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
    serve({
      contentBase: ['dist'],
    }),
  ],
};
