import { contextBridge, ipcRenderer } from 'electron';

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
        const validChannels = ipc.render.send;
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, args);
        }
      },
      // From main to render.
      receive: (channel, listener) => {
        const validChannels = ipc.render.receive;
        if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender`.
          ipcRenderer.on(channel, (event, ...args) => listener(...args));
        }
      },
      // From render to main and back again.
      invoke: (channel, args) => {
        const validChannels = ipc.render.sendReceive;
        if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, args);
        }
      },
    }
  );
};

export default {
  setupIpcSender,
};
