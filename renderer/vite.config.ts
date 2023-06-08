import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { getViteAlias } from '../scripts/build/alias';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    emptyOutDir: true,
    outDir: resolve(__dirname, '../dist/renderer'),
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        danmaku: resolve(__dirname, 'danmaku.html'),
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      ...getViteAlias(),
    },
  },
});
