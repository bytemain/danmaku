import { WebSocket } from 'ws';
import { RoomInfo } from './api';
import zlib from 'zlib';

export enum EPacketType {
  /**
   * 发送者：客户端
   * 客户端发送的心跳包
   * 不发送心跳包，70 秒之后会断开连接，通常每 30 秒发送 1 次
   */
  HEARTBEAT = 2,
  /**
   * 发送者：服务器
   * 心跳回应，Body 内容为房间人气值
   */
  POPULARITY = 3,
  /**
   * 发送者：服务器
   * 消息，弹幕、广播等全部信息
   */
  COMMAND = 5,
  /**
   * 发送者：客户端
   * 认证加入房间
   * 客户端	JSON	进房	WebSocket 连接成功后的发送的第一个数据包，发送要进入房间 ID
   */
  ENTER_ROOM = 7,
  /**
   * 发送者：服务器
   * 进房回应
   */
  ENTER_ROOM_REPLY = 8,
}

export enum ENotificationType {
  /**
   * 弹幕消息
   */
  DANMU_MSG = 'DANMU_MSG',
  /**
   * 直播间广播
   */
  NOTICE_MSG = 'NOTICE_MSG',
  /**
   * 系统信息
   */
  SYS_MSG = 'SYS_MSG',
  /**
   * 房管进入房间
   */
  WELCOME_GUARD = 'WELCOME_GUARD',
  /**
   * 进入特效
   */
  ENTRY_EFFECT = 'ENTRY_EFFECT',
  /**
   * 用户进入房间
   */
  WELCOME = 'WELCOME',
  /**
   * SC留言
   */
  SUPER_CHAT_MESSAGE_JPN = 'SUPER_CHAT_MESSAGE_JPN',
  /**
   * SC留言
   */
  SUPER_CHAT_MESSAGE = 'SUPER_CHAT_MESSAGE',

  WATCHED_CHANGE = 'WATCHED_CHANGE',

  /**
   * 进入房间
   */
  INTERACT_WORD = 'INTERACT_WORD',
}

export enum EGiftType {
  /**
   * 投喂礼物
   */
  SEND_GIFT = 'SEND_GIFT',
  /**
   * 连击礼物
   */
  COMBO_SEND = 'COMBO_SEND',
}

/**
 * 天选之人
 */
export enum EAnchorLotType {
  /**
   * 天选之人开始完整信息
   */
  ANCHOR_LOT_START = 'ANCHOR_LOT_START',
  /**
   * 天选之人获奖 id
   */
  ANCHOR_LOT_END = 'ANCHOR_LOT_END',
  /**
   * 天选之人获奖完整信息
   */
  ANCHOR_LOT_AWARD = 'ANCHOR_LOT_AWARD',
}

export enum ECaptainType {
  /**
   * 上舰长
   */
  GUARD_BUY = 'GUARD_BUY',
  /**
   * 续费了舰长
   */
  USER_TOAST_MSG = 'USER_TOAST_MSG',
  /**
   * 在本房间续费了舰长
   */
  NOTICE_MSG = 'NOTICE_MSG',
}

export enum EBannerType {
  /**
   * 小时榜变动
   */
  ACTIVITY_BANNER_UPDATE_V2 = 'ACTIVITY_BANNER_UPDATE_V2',
}

export enum ESubscriberType {
  /**
   * 粉丝关注变动
   */
  ROOM_REAL_TIME_MESSAGE_UPDATE = 'ROOM_REAL_TIME_MESSAGE_UPDATE',
}

export interface PopularityBody {
  count: number;
}

export interface PacketPayload {
  packetLen: number;
  headerLen: number;
  ver: number;
  op: number;
  seq: number;
  body: any[] | PopularityBody;
}

export class Packet {
  constructor(protected packetType: EPacketType, protected content: any) {}

  send(ws: WebSocket) {
    ws.send(encode(JSON.stringify(this.content), this.packetType));
  }

  static EnterRoom(room: RoomInfo) {
    const content = {
      uid: room.userId,
      roomid: room.roomId,
      protover: 0,
    };
    return new Packet(EPacketType.ENTER_ROOM, content);
  }

  static Heartbeat() {
    return new Packet(EPacketType.HEARTBEAT, {});
  }
}

// @ts-expect-error Node.js does not support params
const textEncoder = new TextEncoder('utf-8');
const textDecoder = new TextDecoder('utf-8');

const readInt = function (buffer, start, len) {
  let result = 0;
  for (let i = len - 1; i >= 0; i--) {
    result += Math.pow(256, len - i - 1) * buffer[start + i];
  }
  return result;
};

const writeInt = function (buffer, start, len, value) {
  let i = 0;
  while (i < len) {
    buffer[start + i] = value / Math.pow(256, len - i - 1);
    i++;
  }
};

export const encode = function (str, op) {
  let data = textEncoder.encode(str);
  let packetLen = 16 + data.byteLength;
  let header = [0, 0, 0, 0, 0, 16, 0, 1, 0, 0, 0, op, 0, 0, 0, 1];
  writeInt(header, 0, 4, packetLen);
  return new Uint8Array(header.concat(...data)).buffer;
};

const decoder = function (blob) {
  let buffer = new Uint8Array(blob);
  let result = {} as PacketPayload;
  result.packetLen = readInt(buffer, 0, 4);
  result.headerLen = readInt(buffer, 4, 2);
  result.ver = readInt(buffer, 6, 2);
  result.op = readInt(buffer, 8, 4);
  result.seq = readInt(buffer, 12, 4);
  if (result.op === EPacketType.COMMAND) {
    result.body = [];
    let offset = 0;
    while (offset < buffer.length) {
      let packetLen = readInt(buffer, offset + 0, 4);
      let headerLen = 16; // readInt(buffer,offset + 4,4)
      if (result.ver == 2) {
        let data = buffer.slice(offset + headerLen, offset + packetLen);
        let newBuffer = zlib.inflateSync(new Uint8Array(data));
        const obj = decoder(newBuffer);
        const body = obj.body;
        result.body = result.body.concat(body);
      } else {
        let data = buffer.slice(offset + headerLen, offset + packetLen);
        let body = textDecoder.decode(data);
        if (body) {
          result.body.push(JSON.parse(body));
        }
      }
      // let body = textDecoder.decode(pako.inflate(data));
      // if (body) {
      //   result.body.push(JSON.parse(body.slice(body.indexOf('{'))));
      // }
      offset += packetLen;
    }
  } else if (result.op === EPacketType.POPULARITY) {
    result.body = {
      count: readInt(buffer, 16, 4),
    };
  }
  return result;
};

/**
 *
 * @param {*} blob
 */
export const decode = function (blob): Promise<PacketPayload> {
  return new Promise(function (resolve, reject) {
    const result = decoder(blob);
    resolve(result);
  });
};
