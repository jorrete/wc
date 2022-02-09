import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: path.resolve(__dirname, 'build'),
    lib: {
      entry: path.resolve(__dirname, 'lib/wc.ts'),
      name: 'WebComponent',
      fileName: (format) => `wc.${format}.js`,
    },
  },
  // esbuild: {
  //   jsxFactory: 'h',
  //   jsxInject: 'import { h } from \'preact\';',
  // }
});
