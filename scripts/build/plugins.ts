import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import glob from 'glob';
import { promisify } from 'util';
import { filesize } from 'filesize';
import { Plugin } from 'esbuild';

const globPromise = promisify(glob);

export function copyResources(_options: { from: string; to: string }) {
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

export function cleanup(options = { pattern: '**/*', safelist: [] }) {
  const { pattern, safelist } = options;
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

export function buildStat(): Plugin {
  return {
    name: 'esbuild:build-stat',
    setup(build) {
      build.onEnd(async (result) => {
        const messages = [] as string[];
        messages.push(`[${new Date().toISOString()}] `);

        const outputs = result.metafile.outputs;
        Object.entries(outputs).forEach(([key, value]) => {
          messages.push(
            `${key}: ${filesize(value.bytes)} (${value.entryPoint})`
          );
        });

        console.log('\n\n' + messages.join('\n'));
      });
    },
  };
}
