import { WebSocket } from 'ws';
import { RoomInfo } from './api';
import zlib from 'zlib';
import { EPacketType, IPacketPayload } from '../../common/types/packet';

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
  const data = textEncoder.encode(str);
  const packetLen = 16 + data.byteLength;
  const header = [0, 0, 0, 0, 0, 16, 0, 1, 0, 0, 0, op, 0, 0, 0, 1];
  writeInt(header, 0, 4, packetLen);
  return new Uint8Array(header.concat(...data)).buffer;
};

const decoder = function (blob) {
  const buffer = new Uint8Array(blob);
  const result = {} as IPacketPayload;
  result.packetLen = readInt(buffer, 0, 4);
  result.headerLen = readInt(buffer, 4, 2);
  result.ver = readInt(buffer, 6, 2);
  result.op = readInt(buffer, 8, 4);
  result.seq = readInt(buffer, 12, 4);
  if (result.op === EPacketType.COMMAND) {
    result.body = [];
    let offset = 0;
    while (offset < buffer.length) {
      const packetLen = readInt(buffer, offset + 0, 4);
      const headerLen = 16; // readInt(buffer,offset + 4,4)
      if (result.ver == 2) {
        const data = buffer.slice(offset + headerLen, offset + packetLen);
        const newBuffer = zlib.inflateSync(new Uint8Array(data));
        const obj = decoder(newBuffer);
        const body = obj.body;
        result.body = result.body.concat(body);
      } else {
        const data = buffer.slice(offset + headerLen, offset + packetLen);
        const body = textDecoder.decode(data);
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
export const decode = function (blob): Promise<IPacketPayload> {
  return new Promise(function (resolve) {
    resolve(decoder(blob));
  });
};
