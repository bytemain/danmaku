import { DanmakuClient } from './live/danmaku';

export const setup = async (roomId) => {
  const danmakuClient = new DanmakuClient({
    appKey: '',
    secret: '',
    roomId,
  });
  await danmakuClient.start();
};
