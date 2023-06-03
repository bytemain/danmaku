import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'node:module';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    mainFields: ['module', 'import', 'require', 'jsnext:main', 'jsnext'],
    browserField: false,
    alias: {
      ws: './node_modules/ws/index.js',
    },
  },
  build: {
    minify: false,
    reportCompressedSize: false,
    assetsDir: 'chunks',
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules.flatMap((m) => [m, `node:${m}`]),
      ],
      input: {
        main: resolve(__dirname, 'main/index.ts'),
      },
      output: {
        entryFileNames: `[name].js`,
        format: 'commonjs',
      },
    },
  },
});
