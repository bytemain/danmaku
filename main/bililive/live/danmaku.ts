import { EventEmitter } from 'events';
import { APIClient, RoomInfo } from './api';
import {
  Packet,
  decode,
  encode,
  EPacketType,
  PopularityBody,
  ENotificationType,
  EGiftType,
} from './packet';

import WebSocket from 'ws';
import {
  EDanmakuEventName,
  IDanmaku,
  IGift,
  IWelcome,
} from 'common/types/danmaku';
import { Danmaku } from './entity/danmaku';

const chatUrl = 'wss://broadcastlv.chat.bilibili.com:2245/sub';

export interface DanmakuClientOptions {
  appKey: string;
  secret: string;
  roomId: number;
}

class WebSocketClient {
  constructor(public roomInfo: RoomInfo, private eventEmitter: EventEmitter) {}

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
          this.eventEmitter.emit(EDanmakuEventName.POPULARITY, count);
          break;
        case EPacketType.COMMAND:
          (packet.body as any[]).forEach((body) => {
            console.log(body);
            switch (body.cmd) {
              case ENotificationType.DANMU_MSG:
                const danmaku = new Danmaku(body.info);
                console.log(danmaku.toString());
                this.eventEmitter.emit(EDanmakuEventName.DANMAKU, danmaku);
                break;
              case EGiftType.SEND_GIFT:
                console.log(
                  `${body.data.uname} ${body.data.action} ${body.data.num} 个 ${body.data.giftName}`
                );
                this.eventEmitter.emit(EDanmakuEventName.GIFT, {
                  username: body.data.uname,
                  action: body.data.action,
                  num: body.data.num,
                  giftName: body.data.giftName,
                } as IGift);
                break;
              case ENotificationType.WELCOME:
                console.log(`欢迎 ${body.data.uname}`);
                this.eventEmitter.emit(EDanmakuEventName.WELCOME, {
                  username: body.data.uname,
                } as IWelcome);
                break;
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

  private eventEmitter = new EventEmitter();

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
    const client = new WebSocketClient(roomInfo, this.eventEmitter);
    client.start();
  }
  async onPopularity(callback: (count: number) => void) {
    this.eventEmitter.on(EDanmakuEventName.POPULARITY, callback);
  }
  async onDanmaku(callback: (danmaku: Danmaku) => void) {
    this.eventEmitter.on(EDanmakuEventName.DANMAKU, callback);
  }
  async onGift(callback: (gift: IGift) => void) {
    this.eventEmitter.on(EDanmakuEventName.GIFT, callback);
  }
  async onWelcome(callback: (welcome: IWelcome) => void) {
    this.eventEmitter.on(EDanmakuEventName.WELCOME, callback);
  }
}
