import { WebSocket } from 'ws';
import { RoomInfo } from './api';

export class Packet {
  constructor(packetType: any, content: any, shortTag?: number, tag?: number);
  send(ws: WebSocket): void;
  static EnterRoom(roomInfo: RoomInfo): Packet;
  static Heartbeat(): Packet;
}
export const encode: (str: any, op: any) => ArrayBufferLike;
export const decode: (blob: any) => Promise<PacketPayload>;

export interface PacketPayload {
  packetLen: number;
  headerLen: number;
  ver: number;
  op: number;
  seq: number;
  body:
    | any[]
    | {
        count: number;
      };
}
export const enum EPacketType {
  /**
   * 客户端发送的心跳包
   */
  HEARTBEAT = 2,
  /**
   * 人气，心跳包回复
   */
  POPULARITY = 3,
  /**
   * 消息
   */
  COMMAND = 5,
  /**
   * 认证加入房间
   */
  ENTER_ROOM = 7,
  /**
   * 服务器发送的心跳包，客户端收到此信息时需要返回一个心跳包
   */
  ENTER_ROOM_REPLY = 8,
}
