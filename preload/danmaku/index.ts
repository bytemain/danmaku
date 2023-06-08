import { contextBridge, ipcRenderer } from 'electron/renderer';

import mri from 'mri';

const argv = mri(process.argv.slice(2)) as mri.Argv<{
  roomId: string;
}>;

export interface IMainWorld {
  operation: {
    rightClick: () => void;
  };
  env: {
    roomId: string;
  };
}

contextBridge.exposeInMainWorld('operation', {
  rightClick: async () => await ipcRenderer.invoke('danmaku-menu'),
} as IMainWorld['operation']);

contextBridge.exposeInMainWorld('env', {
  roomId: argv.roomId,
});

ipcRenderer.invoke('get-owner-browser-window-id').then((id) => {
  console.log(`🚀 ~ file: index.js:41 ~ ipcRenderer.invoke ~ id:`, id);

  ipcRenderer.on('danmaku-notification' + id, (e, arg: any) => {
    console.log(
      `🚀 ~ file: index.js:35 ~ ipcRenderer.on ~ 'danmaku-notification' + id:`,
      'danmaku-notification' + id
    );
    const messageEvent = new MessageEvent('danmaku-notification', {
      data: arg,
    });
    window.dispatchEvent(messageEvent);
  });

  ipcRenderer.send('main-world-setup-channel-done' + id, 'ok');
});
