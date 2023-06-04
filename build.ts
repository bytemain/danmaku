import 'dotenv/config';
import { context as createContext, BuildOptions } from 'esbuild';
import mri from 'mri';
import { resolve } from 'path';
import { builtinModules } from 'node:module';
import { buildStat, cleanup } from 'scripts/build/plugins';

export const buildParams = {
  minify: false,
  color: true,
  loader: {
    '.html': 'text',
    '.svg': 'text',
  },
  bundle: true,
  outdir: 'dist',
  outbase: '.',
  logLevel: 'debug',
  metafile: true,
  external: ['electron', ...builtinModules.flatMap((m) => [m, `node:${m}`])],
} as BuildOptions;

const argv = mri(process.argv.slice(2));

const define = {
  'process.env.NODE_ENV': JSON.stringify(
    argv.watch ? 'development' : 'production'
  ),
} as Record<string, string>;

const preloadScripts = {
  index: 'preload/index.ts',
  danmaku: 'preload/danmaku/index.ts',
};

async function buildNode() {
  const context = await createContext({
    ...buildParams,
    entryPoints: [
      resolve(__dirname, 'main/index.ts'),
      ...Object.values(preloadScripts).map((v) => resolve(__dirname, v)),
    ],
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    define,
    plugins: [cleanup(), buildStat()].filter(Boolean),
  });

  if (argv['watch']) {
    await context.watch();
  } else {
    await context.rebuild();
    context.dispose();
  }
}

async function main() {
  await buildNode();
}

main();
