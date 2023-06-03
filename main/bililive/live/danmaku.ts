import { APIClient, RoomInfo } from './api';
import { Packet, decode, encode, EPacketType, PopularityBody } from './packet';

import WebSocket from 'ws';

const chatUrl = 'wss://broadcastlv.chat.bilibili.com:2245/sub';

export interface DanmakuClientOptions {
  appKey: string;
  secret: string;
  roomId: number;
}
class WebSocketClient {
  constructor(public roomInfo: RoomInfo) {}

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
          const count = (packet.body as PopularityBody).count;
          console.log(`人气：${count}`);
          break;
        case EPacketType.COMMAND:
          (packet.body as any[]).forEach((body) => {
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

export class DanmakuClient {
  appKey: string;
  secret: string;
  roomId: number;

  constructor(options: DanmakuClientOptions) {
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
