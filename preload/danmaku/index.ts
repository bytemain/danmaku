import { danmakuNotificationChannel } from '@common/ipc';
import { contextBridge, ipcRenderer } from 'electron/renderer';

import mri from 'mri';

const argv = mri(process.argv.slice(2)) as mri.Argv<{
  roomId: string;
}>;

export interface IMainWorld {
  operation: {
    rightClick: () => void;
    retrieveDanmaku: () => void;
  };
  env: {
    roomId: string;
  };
}

contextBridge.exposeInMainWorld('operation', {
  rightClick: async () => await ipcRenderer.invoke('danmaku-menu'),
  retrieveDanmaku: async () =>
    await ipcRenderer.invoke('retrieve-danmaku', {
      roomId: argv.roomId,
    }),
} as IMainWorld['operation']);

contextBridge.exposeInMainWorld('env', {
  roomId: argv.roomId,
});

ipcRenderer.on(danmakuNotificationChannel, (e, arg: any) => {
  const messageEvent = new MessageEvent(danmakuNotificationChannel, {
    data: arg,
  });
  window.dispatchEvent(messageEvent);
});
