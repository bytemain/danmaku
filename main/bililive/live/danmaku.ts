import { EventEmitter } from 'eventemitter3';

import { APIClient, RoomInfo } from './api';
import { Packet, decode } from './packet';

import WebSocket from 'ws';
import { EDanmakuEventName, IGift, IWelcome } from 'common/types/danmaku';
import { Danmaku } from './entity/danmaku';
import { Disposable } from 'common/disposable';
import { LimitedArray } from './utils';
import { Popularity } from './entity/popularity';
import { ENotificationType, EPacketType } from './types/packet';
import { IWatchedChange } from './entity/watchedChange';

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
        case EPacketType.POPULARITY: {
          const popularity = new Popularity(packet.body);
          console.log(popularity.toString());
          this.eventEmitter.emit(EDanmakuEventName.POPULARITY, popularity);
          break;
        }
        case EPacketType.COMMAND:
          (packet.body as any[]).forEach((body) => {
            switch (body.cmd) {
              case ENotificationType.WATCHED_CHANGE: {
                const data = body.data as IWatchedChange;
                console.log(
                  `🚀 ~ file: danmaku.ts:55 ~ WebSocketClient ~ data:`,
                  data
                );
                break;
              }
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
              case ENotificationType.SEND_GIFT: {
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
  private hostEventEmitter = new HostEventListener();

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
    const client = new WebSocketClient(roomInfo, this.hostEventEmitter);
    client.start();
    this.#started = true;
  }

  addEventEmitter(eventEmitter: EventEmitter) {
    return this.hostEventEmitter.addAgent(eventEmitter);
  }

  replayEvent(eventEmitter: EventEmitter) {
    this.hostEventEmitter.replay(eventEmitter);
  }
}

class HostEventListener extends EventEmitter {
  #agents = [] as EventEmitter[];
  limitedArray = new LimitedArray(10);

  addAgent(agent: EventEmitter) {
    if (this.#agents.includes(agent)) {
      console.log('agent already exists');
      return Disposable.create(() => {
        // do nothing
      });
    }

    this.#agents.push(agent);
    return Disposable.create(() => {
      const index = this.#agents.indexOf(agent);
      if (index > -1) {
        this.#agents.splice(index, 1);
      }
    });
  }
  emit(event: string | symbol, ...args: any[]) {
    console.log(
      `🚀 ~ file: danmaku.ts:188 ~ HostEventListener ~ emit ~ event:`,
      event
    );
    this.limitedArray.push({ event, args });
    this.#agents.forEach((agent) => {
      agent.emit(event, ...args);
    });
    return true;
  }

  replay(eventEmitter: EventEmitter) {
    this.limitedArray.forEach(({ event, args }) => {
      eventEmitter.emit(event, ...args);
    });
  }
}

export class AgentEventListener extends EventEmitter {
  onPopularity(callback: (popularity: Popularity) => void) {
    this.on(EDanmakuEventName.POPULARITY, callback);
    return Disposable.create(() => {
      this.off(EDanmakuEventName.POPULARITY, callback);
    });
  }
  onDanmaku(callback: (danmaku: Danmaku) => void) {
    this.on(EDanmakuEventName.DANMAKU, callback);
    return Disposable.create(() => {
      this.off(EDanmakuEventName.DANMAKU, callback);
    });
  }
  onGift(callback: (gift: IGift) => void) {
    this.on(EDanmakuEventName.GIFT, callback);
    return Disposable.create(() => {
      this.off(EDanmakuEventName.GIFT, callback);
    });
  }
  onWelcome(callback: (welcome: IWelcome) => void) {
    this.on(EDanmakuEventName.WELCOME, callback);
    return Disposable.create(() => {
      this.off(EDanmakuEventName.WELCOME, callback);
    });
  }
}
