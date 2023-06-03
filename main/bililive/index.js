const { DanmakuClient } = require('./live/danmaku');

const setup = async (roomId) => {
  const danmakuClient = new DanmakuClient({
    appKey: '',
    secret: '',
    roomId,
  });
  await danmakuClient.start();
};

module.exports = {
  setup,
};
