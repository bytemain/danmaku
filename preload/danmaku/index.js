const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld(
  'operation',
  /** @type {import('./index').IMainWorld['operation']} */
  ({
    rightClick: async () => await ipcRenderer.invoke('danmaku-menu'),
  })
);
