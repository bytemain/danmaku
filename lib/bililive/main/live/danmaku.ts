import { EventEmitter } from 'eventemitter3';

import { APIClient, IGetInfoResponse, RoomInfo } from './api';
import { Packet, decode } from './packet';

import WebSocket from 'ws';
import { Danmaku } from '../../common/entity/danmaku';
import { Disposable } from 'common/disposable';
import { LimitedArray } from './utils';
import { Popularity } from '../../common/entity/popularity';
import { ENotificationType, EPacketType } from '../../common/types/packet';
import { IPacketWatchedChange } from '../../common/entity/watchedChange';
import {
  DanmakuClientOptions,
  EMessageEventCommandPayload,
  EMessageEventType,
} from '../../common/types/danmaku';
import { Gift } from 'lib/bililive/common/entity/gift';
import { Welcome } from 'lib/bililive/common/entity/welcome';

const chatUrl = 'wss://broadcastlv.chat.bilibili.com:2245/sub';

class WebSocketClient {
  constructor(public roomInfo: RoomInfo, private eventEmitter: EventEmitter) {}

  start() {
    console.log('websocket started');

    const ws = new WebSocket(chatUrl);
    ws.on('open', () => {
      Packet.EnterRoom(this.roomInfo).send(ws);
    });

    ws.on('message', async (data) => {
      const packet = await decode(data);
      switch (packet.op) {
        case EPacketType.POPULARITY: {
          const popularity = new Popularity(packet.body);
          console.log(popularity.toString());
          this.eventEmitter.emit(EMessageEventType.POPULARITY, popularity);
          break;
        }
        case EPacketType.COMMAND:
          (packet.body as any[]).forEach((body) => {
            switch (body.cmd) {
              case ENotificationType.WATCHED_CHANGE: {
                const data = body.data as IPacketWatchedChange;
                console.log(
                  `🚀 ~ file: danmaku.ts:55 ~ WebSocketClient ~ data:`,
                  data
                );
                this.eventEmitter.emit(EMessageEventType.COMMAND, {
                  name: ENotificationType.WATCHED_CHANGE,
                  data: data,
                });
                break;
              }
              case ENotificationType.DANMU_MSG: {
                const danmaku = new Danmaku(body.info);
                console.log(danmaku.toString());
                this.eventEmitter.emit(EMessageEventType.COMMAND, {
                  name: ENotificationType.DANMU_MSG,
                  data: danmaku,
                });
                break;
              }
              case ENotificationType.SEND_GIFT: {
                const gift = new Gift(body.data);
                console.log(
                  `🚀 ~ file: danmaku.ts:69 ~ WebSocketClient ~ body.data:`,
                  body.data
                );

                this.eventEmitter.emit(EMessageEventType.COMMAND, {
                  name: ENotificationType.SEND_GIFT,
                  data: gift,
                });
                break;
              }
              case ENotificationType.WELCOME: {
                const welcome = new Welcome(body.data);
                console.log(welcome.toString());
                this.eventEmitter.emit(EMessageEventType.COMMAND, {
                  name: ENotificationType.WELCOME,
                  data: welcome,
                });
                break;
              }
              case ENotificationType.INTERACT_WORD: {
                const welcome = new Welcome(body.data);
                console.log(welcome.toString());

                this.eventEmitter.emit(EMessageEventType.COMMAND, {
                  name: ENotificationType.INTERACT_WORD,
                  data: welcome,
                });
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
      console.log('send heartbeat');
      Packet.Heartbeat().send(ws);
    }, 30 * 1000);
  }
}

export class DanmakuClient {
  id: number;

  static #instanceMap = new Map<string, DanmakuClient>();
  appKey: string;
  secret: string;
  roomId: number;

  public roomInfo?: IGetInfoResponse['data'];

  started = false;
  private hostEventEmitter = new HostEventListener();

  static nextId = 0;
  apiClient: APIClient;

  static getNextId() {
    return this.nextId++;
  }
  private constructor(options: DanmakuClientOptions) {
    this.id = DanmakuClient.getNextId();
    this.appKey = options.appKey;
    this.secret = options.secret;
    this.roomId = options.roomId;
    this.apiClient = new APIClient(this.appKey, this.secret);
  }

  static instance(roomId: string) {
    // 有时候传入的是数字，有时候传入的是字符串
    roomId = roomId.toString();
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

  async getRoomInfo(): Promise<IGetInfoResponse['data'] | undefined> {
    if (this.roomInfo) {
      return this.roomInfo;
    }
    const moreInfo = await this.apiClient.getRoomInfo(this.roomId);
    console.log(
      `🚀 ~ file: danmaku.ts:173 ~ DanmakuClient ~ start ~ moreInfo:`,
      moreInfo
    );
    this.roomInfo = moreInfo;
    return this.roomInfo;
  }

  async start() {
    if (this.started) {
      console.log('already started');
      return;
    }
    this.started = true;
    console.log(`🚀 ~ file: danmaku.ts:180 ~ DanmakuClient ~ start ~ started:`);

    const roomInfo = await this.apiClient.initRoom(this.roomId);

    console.log(`connect to room`, roomInfo);
    const client = new WebSocketClient(roomInfo, this.hostEventEmitter);
    client.start();
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
  _beforeEmit = [] as (() => boolean)[];
  registerBeforeEmit(cb: () => boolean) {
    this._beforeEmit.push(cb);
  }
  emit<T extends string | symbol>(event: T, ...args: any[]): boolean {
    if (this._beforeEmit.some((cb) => cb())) {
      return false;
    }

    return super.emit(event, ...args);
  }
  onPopularity(callback: (popularity: Popularity) => void) {
    this.on(EMessageEventType.POPULARITY, callback);
    return Disposable.create(() => {
      this.off(EMessageEventType.POPULARITY, callback);
    });
  }
  onCommand(callback: (command: EMessageEventCommandPayload<any>) => void) {
    this.on(EMessageEventType.COMMAND, callback);
    return Disposable.create(() => {
      this.off(EMessageEventType.COMMAND, callback);
    });
  }
  dispose() {
    this.removeAllListeners();
  }
}
