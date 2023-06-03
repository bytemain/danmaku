const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld(
  'danmaku',
  /** @type {import('./index').IMainWorld['danmaku']} */
  ({
    open: async (roomId) => await ipcRenderer.invoke('open-danmaku', roomId),
  })
);
