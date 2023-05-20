import type { IMainWorld } from '../preload/index.d.ts';

declare global {
  declare const versions: IMainWorld['versions'];
}
