import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    watch: {
      ignored: ['**/IMG_4597.PNG'],
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        netizen: resolve(root, 'netizen.html'),
      },
    },
  },
});