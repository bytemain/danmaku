'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// White-listed channels.
const defaultOptions = {
  render: {
    // From render to main.
    send: [],
    // From main to render.
    receive: [],
    // From render to main and back again.
    sendReceive: [],
  },
};

const setupIpcSender = (_config) => {
  const ipc = _config || defaultOptions;
  // Exposed protected methods in the render process.
  contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods.
    'ipcRender',
    {
      // From render to main.
      send: (channel, args) => {
        let validChannels = ipc.render.send;
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, args);
        }
      },
      // From main to render.
      receive: (channel, listener) => {
        let validChannels = ipc.render.receive;
        if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender`.
          ipcRenderer.on(channel, (event, ...args) => listener(...args));
        }
      },
      // From render to main and back again.
      invoke: (channel, args) => {
        let validChannels = ipc.render.sendReceive;
        if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, args);
        }
      },
    }
  );
};

module.exports = {
  setupIpcSender,
};
