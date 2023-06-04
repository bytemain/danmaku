import { contextBridge, ipcRenderer } from 'electron/renderer';

export interface IMainWorld {
  danmaku: {
    open: (roomId: string) => void;
  };
}

contextBridge.exposeInMainWorld('danmaku', {
  open: async (roomId) => await ipcRenderer.invoke('open-danmaku', roomId),
} as IMainWorld['danmaku']);
