import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import wc from './lib/vite';

export default defineConfig({
  root: 'src',
  plugins: [
    wc(),
  ],
  build: {
    outDir: path.resolve(__dirname, 'build'),
    lib: {
      entry: path.resolve(__dirname, 'lib/wc.ts'),
      name: 'WebComponent',
      fileName: (format) => `wc.${format}.js`,
    },
  },
});
