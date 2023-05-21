/// <reference types="vite/client" />

import type { IMainWorld } from '../../preload/index.d.ts';

declare global {
  const versions: IMainWorld['versions'];
  const danmaku: IMainWorld['danmaku'];
}
