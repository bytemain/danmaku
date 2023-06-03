/**
 * @enum {import('./packet').EPacketType}
 */
const EPacketType = {
  // 客户端发送的心跳包
  HEARTBEAT: 2,
  // 人气，心跳包回复
  POPULARITY: 3,
  // 消息
  COMMAND: 5,
  // 认证加入房间
  ENTER_ROOM: 7,
  // 服务器发送的心跳包，客户端收到此信息时需要返回一个心跳包
  ENTER_ROOM_REPLY: 8,
};

class Packet {
  constructor(packetType, content, shortTag = 1, tag = 1) {
    this.packetType = packetType;
    this.content = content;
    this.shortTag = shortTag;
    this.tag = tag;
  }

  /**
   *
   * @param {import('ws').WebSocket} ws
   */
  send(ws) {
    ws.send(encode(JSON.stringify(this.content), this.packetType));
  }

  /**
   *
   * @param {import('./api').RoomInfo} room
   */
  static EnterRoom(room) {
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

const encode = function (str, op) {
  let data = textEncoder.encode(str);
  let packetLen = 16 + data.byteLength;
  let header = [0, 0, 0, 0, 0, 16, 0, 1, 0, 0, 0, op, 0, 0, 0, 1];
  writeInt(header, 0, 4, packetLen);
  return new Uint8Array(header.concat(...data)).buffer;
};

const zlib = require('zlib');

const decoder = function (blob) {
  let buffer = new Uint8Array(blob);
  let result = {};
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
 * @returns {import('./packet').PacketPayload}
 */
const decode = function (blob) {
  return new Promise(function (resolve, reject) {
    const result = decoder(blob);
    resolve(result);
  });
};

module.exports = {
  EPacketType,
  Packet,
  decode,
  encode,
};
