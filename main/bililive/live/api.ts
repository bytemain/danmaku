import md5 from '../../utils/crypto/md5';

const apiUrl = 'https://api.live.bilibili.com';

const apiRoute = {
  roomInit: '/room/v1/Room/room_init',
};

const kBuildVersionId = 'XZEBD7DEB19AE02C8BDBB8B7919D7AAF02180';
const kDeviceId = 'KREhESMUJRMlEiVGOkY6QDgJblpoC3sRdQ';

const getCommonHeaders = (initTime) => ({
  'Display-ID': `${kBuildVersionId}-${initTime}`,
  Buvid: kBuildVersionId,
  'User-Agent': 'Mozilla/5.0 BiliDroid/5.39.0',
  'Device-ID': kDeviceId,
  'Accept-Encoding': 'gzip',
});

const getCommonQuery = (appKey) => ({
  actionKey: 'appkey',
  appkey: appKey,
  build: '5390000',
  device: 'android',
  mobi_app: 'android',
  platform: 'android',
});

export class RoomInfo {
  roomId: string;
  userId: string;
  constructor(data) {
    this.roomId = data.data.room_id;
    this.userId = data.data.uid;
  }
}

export class APIClient {
  appKey: any;
  secretKey: any;
  initTime: number;
  constructor(appKey, secret) {
    this.appKey = appKey;
    this.secretKey = secret;
    this.initTime = Math.floor(Date.now() / 1000);
  }
  /**
   * @param {string} roomId
   */
  async initRoom(roomId) {
    const query = {
      id: roomId,
      ts: this.initTime + '',
      ...getCommonQuery(this.appKey),
    } as Record<string, string>;
    query.sign = this.#sign(query);
    const result = await this.#call(apiRoute.roomInit, query);
    if (result.code !== 0) {
      throw new Error(result.message);
    }
    return new RoomInfo(result);
  }

  /**
   * @param {Record<string, string>} query
   */
  #sign(query) {
    const sortedKeys = Object.keys(query).sort();
    const str = sortedKeys.map((key) => `${key}=${query[key]}`).join('&');
    return md5(str + this.secretKey);
  }

  async #call(route, query, headers?: Record<string, string>) {
    const url = new URL(apiUrl + route);
    Object.keys(query).forEach((key) =>
      url.searchParams.append(key, query[key])
    );
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getCommonHeaders(this.initTime),
        ...headers,
      },
    });
    return await res.json();
  }
}
