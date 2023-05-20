export interface IMainWorld {
  versions: {
    electron: () => string;
    chrome: () => string;
    node: () => string;
    ping: () => Promise<string>;
  };
}
