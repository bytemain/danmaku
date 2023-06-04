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

ipcRenderer.invoke('get-owner-browser-window-id').then((id) => {
  ipcRenderer.once('main-world-setup-channel' + id, (e) => {
    console.log('main-world-setup-channel' + id);
    console.log(`🚀 ~ file: index.js:41 ~ ipcRenderer.invoke ~ id:`, id);

    ipcRenderer.on('danmaku-notification' + id, (e, arg) => {
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
});
