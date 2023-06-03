export interface IMainWorld {
  versions: {
    electron: () => string;
    chrome: () => string;
    node: () => string;
    ping: () => Promise<string>;
  };
  danmaku: {
    open: (roomId: string) => void;
  };
}
