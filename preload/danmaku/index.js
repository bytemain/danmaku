const { contextBridge, ipcRenderer } = require('electron/renderer');

const argv = {};

process.argv.forEach((arg) => {
  if (arg.startsWith('--roomId=')) {
    argv.roomId = arg.slice('--roomId='.length);
  }
});

contextBridge.exposeInMainWorld(
  'operation',
  /** @type {import('./index').IMainWorld['operation']} */
  ({
    rightClick: async () => await ipcRenderer.invoke('danmaku-menu'),
  })
);

contextBridge.exposeInMainWorld('env', {
  roomId: argv.roomId,
});

contextBridge.exposeInMainWorld('bililive', {
  onPopularity: (callback) => {
    ipcRenderer.on('popularity', (event, arg) => callback(arg));
  },
});

ipcRenderer.on('main-world-ready', (e) => {
  const messageEvent = new MessageEvent('message', {
    data: {
      type: 'main-world-ready',
    },
    source: parent,
  });
  console.log(
    `🚀 ~ file: index.js:31 ~ ipcRenderer.on ~ messageEvent:`,
    messageEvent
  );
  window.dispatchEvent(messageEvent);
});

ipcRenderer.on('danmaku-notification', (e, arg) => {
  console.log(`🚀 ~ file: index.js:44 ~ ipcRenderer.on ~ arg:`, arg);
  const messageEvent = new MessageEvent('danmaku-notification', {
    data: arg,
    source: parent,
  });
  window.dispatchEvent(messageEvent);
});
