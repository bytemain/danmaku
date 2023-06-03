const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld(
  'versions',
  /** @type {import('./index').IMainWorld['versions']} */ ({
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: async () => await ipcRenderer.invoke('ping'),
  })
);

contextBridge.exposeInMainWorld(
  'danmaku',
  /** @type {import('./index').IMainWorld['danmaku']} */
  ({
    open: async (roomId) => await ipcRenderer.invoke('open-danmaku', roomId),
  })
);
