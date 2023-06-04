import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import glob from 'glob';
import { promisify } from 'util';
import { context as createContext, BuildOptions, Plugin } from 'esbuild';
import mri from 'minimist';
import { resolve } from 'path';
import { builtinModules } from 'node:module';

const globPromise = promisify(glob);

function copyResources(_options: { from: string; to: string }) {
  const { from, to } = _options;
  return {
    name: 'esbuild:copy-resources',
    setup(build) {
      const options = build.initialOptions;
      if (!options.outdir) {
        console.log(
          '[esbuild copy-resources] Not outdir configured - skipping the copy'
        );
        return;
      }
      build.onEnd(async (result) => {
        try {
          console.time('[esbuild copy-resources] copy resources');
          const baseDir = path.join(from, '**/*.js');
          const files = await globPromise(baseDir);
          for (const file of files) {
            const relative = path.relative(from, file);

            const target = path.resolve(
              __dirname,
              path.join(options.outdir, to, relative)
            );
            console.log(`[esbuild copy-resources] ${relative}`);

            await fs.mkdir(path.dirname(target), { recursive: true });
            await fs.copyFile(file, target);
          }
        } finally {
          console.timeEnd('[esbuild copy-resources] copy resources');
        }
      });
    },
  } as Plugin;
}

function cleanup(options = { pattern: '**/*', safelist: [], debug: false }) {
  const { pattern, safelist, debug } = options;
  return {
    name: 'esbuild:cleanup',
    setup(build) {
      const options = build.initialOptions;
      if (!options.outdir) {
        console.log(
          '[esbuild cleanup] Not outdir configured - skipping the cleanup'
        );
        return;
      }
      if (!options.metafile) {
        console.log(
          '[esbuild cleanup] Metafile is not enabled - skipping the cleanup'
        );
        return;
      }
      const safelistSet = new Set(safelist);
      build.onEnd(async (result) => {
        try {
          console.time('[esbuild cleanup] Cleaning up old assets');
          Object.keys(result.metafile.outputs).forEach((path) =>
            safelistSet.add(path)
          );
          const files = await globPromise(path.join(options.outdir, pattern), {
            nodir: true,
          });

          for (const file of files) {
            if (!safelistSet.has(file)) {
              try {
                await fs.unlink(file);
                console.log('[esbuild cleanup] Removed old file: ' + file);
              } catch (error) {
                console.log('[esbuild cleanup] ' + error);
              }
            }
          }
        } finally {
          console.timeEnd('[esbuild cleanup] Cleaning up old assets');
        }
      });
    },
  } as Plugin;
}

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
    metafile: true,
    plugins: [cleanup(undefined)],
  });

  if (argv['watch']) {
    await context.watch();
  } else {
    await context.rebuild().then((v) => {
      console.log(`build ~ result`, v);
      context.dispose();
    });
  }
}

async function main() {
  await buildNode();
}

main();
