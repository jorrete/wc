import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import wc from '../lib/vite';

export default defineConfig({
  root: 'src',
  plugins: [
    wc(),
  ],
});
