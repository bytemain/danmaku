import { EventEmitter } from 'eventemitter3';
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
import { Disposable } from 'common/disposable';

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
      console.log(
        `🚀 ~ file: danmaku.ts:42 ~ WebSocketClient ~ ws.on ~ packet:`,
        packet
      );
      switch (packet.op) {
        case EPacketType.POPULARITY:
          const count = (packet.body as PopularityBody).count;
          console.log(`人气：${count}`);
          this.eventEmitter.emit(EDanmakuEventName.POPULARITY, count);
          break;
        case EPacketType.COMMAND:
          (packet.body as any[]).forEach((body) => {
            switch (body.cmd) {
              case ENotificationType.DANMU_MSG: {
                const danmaku = new Danmaku(body.info);
                console.log(
                  `🚀 ~ file: danmaku.ts:61 ~ WebSocketClient ~ body.info:`,
                  body.info
                );
                console.log(danmaku.toString());
                this.eventEmitter.emit(EDanmakuEventName.DANMAKU, danmaku);
                break;
              }
              case EGiftType.SEND_GIFT: {
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
              }
              case ENotificationType.WELCOME: {
                console.log(`欢迎 ${body.data.uname}`);
                this.eventEmitter.emit(EDanmakuEventName.WELCOME, {
                  username: body.data.uname,
                  uid: body.data.uid,
                  type: ENotificationType.WELCOME,
                } as IWelcome);
                break;
              }
              case ENotificationType.INTERACT_WORD: {
                console.log(`欢迎 ${body.data.uname}`);
                this.eventEmitter.emit(EDanmakuEventName.WELCOME, {
                  username: body.data.uname,
                  uid: body.data.uid,
                  type: ENotificationType.INTERACT_WORD,
                } as IWelcome);
                break;
              }
              default:
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
  static #instanceMap = new Map<string, DanmakuClient>();
  appKey: string;
  secret: string;
  roomId: number;

  #started = false;

  private eventEmitter = new EventEmitter();

  private constructor(options: DanmakuClientOptions) {
    this.appKey = options.appKey;
    this.secret = options.secret;
    this.roomId = options.roomId;
  }

  static instance(roomId: string) {
    if (this.#instanceMap.has(roomId)) {
      return this.#instanceMap.get(roomId);
    }

    const client = new DanmakuClient({
      appKey: '',
      secret: '',
      roomId: Number(roomId),
    });
    this.#instanceMap.set(roomId, client);
    return client;
  }

  async start() {
    if (this.#started) {
      return;
    }
    const apiClient = new APIClient(this.appKey, this.secret);
    const roomInfo = await apiClient.initRoom(this.roomId);
    console.log(
      `🚀 ~ file: danmaku.js:84 ~ DanmakuClient ~ start ~ roomInfo:`,
      roomInfo
    );
    const client = new WebSocketClient(roomInfo, this.eventEmitter);
    client.start();
    this.#started = true;
  }

  onPopularity(callback: (count: number) => void) {
    this.eventEmitter.on(EDanmakuEventName.POPULARITY, callback);
    return Disposable.create(() => {
      this.eventEmitter.off(EDanmakuEventName.POPULARITY, callback);
    });
  }
  onDanmaku(callback: (danmaku: Danmaku) => void) {
    this.eventEmitter.on(EDanmakuEventName.DANMAKU, callback);
    return Disposable.create(() => {
      this.eventEmitter.off(EDanmakuEventName.DANMAKU, callback);
    });
  }
  onGift(callback: (gift: IGift) => void) {
    this.eventEmitter.on(EDanmakuEventName.GIFT, callback);
    return Disposable.create(() => {
      this.eventEmitter.off(EDanmakuEventName.GIFT, callback);
    });
  }
  onWelcome(callback: (welcome: IWelcome) => void) {
    this.eventEmitter.on(EDanmakuEventName.WELCOME, callback);
    return Disposable.create(() => {
      this.eventEmitter.off(EDanmakuEventName.WELCOME, callback);
    });
  }
}
