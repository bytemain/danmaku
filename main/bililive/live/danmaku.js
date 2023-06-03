const { APIClient } = require('./api');
const { Packet, decode, encode, EPacketType } = require('./packet');

const WebSocket = require('ws');

const chatUrl = 'wss://broadcastlv.chat.bilibili.com:2245/sub';

class WebSocketClient {
  /**
   * @param {import('./api').RoomInfo} roomInfo
   */
  constructor(roomInfo) {
    this.roomInfo = roomInfo;
  }

  start() {
    const ws = new WebSocket(chatUrl);
    ws.on('open', () => {
      Packet.EnterRoom(this.roomInfo).send(ws);
    });

    ws.on('message', async (data) => {
      const packet = await decode(data);
      console.log(packet);
      switch (packet.op) {
        case EPacketType.ENTER_ROOM:
          break;
        case EPacketType.HEARTBEAT:
          break;
        case EPacketType.POPULARITY:
          const count = packet.body.count;
          console.log(`人气：${count}`);
          break;
        case EPacketType.COMMAND:
          packet.body.forEach((body) => {
            console.log(body);
            switch (body.cmd) {
              case 'DANMU_MSG':
                console.log(`${body.info[2][1]}: ${body.info[1]}`);
                break;
              case 'SEND_GIFT':
                console.log(
                  `${body.data.uname} ${body.data.action} ${body.data.num} 个 ${body.data.giftName}`
                );
                break;
              case 'WELCOME':
                console.log(`欢迎 ${body.data.uname}`);
                break;
              // 此处省略很多其他通知类型
              default:
                console.log(body);
            }
          });
          break;
        case EPacketType.ENTER_ROOM_REPLY:
          break;
        default:
          break;
      }
    });

    this.setupHeartbeat(ws);
  }
  setupHeartbeat(ws) {
    setInterval(() => {
      Packet.Heartbeat().send(ws);
    }, 30 * 1000);
  }
}

class DanmakuClient {
  /**
   * @param {import('./danmaku').DanmakuClientOptions} options
   */
  constructor(options) {
    this.appKey = options.appKey;
    this.secret = options.secret;
    this.roomId = options.roomId;
  }

  async start() {
    const apiClient = new APIClient(this.appKey, this.secret);
    const roomInfo = await apiClient.initRoom(this.roomId);
    console.log(
      `🚀 ~ file: danmaku.js:84 ~ DanmakuClient ~ start ~ roomInfo:`,
      roomInfo
    );
    const client = new WebSocketClient(roomInfo);
    client.start();
  }
}

module.exports = {
  DanmakuClient,
};
