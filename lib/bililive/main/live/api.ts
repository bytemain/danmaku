import md5 from '../crypto/md5';

const apiUrl = 'https://api.live.bilibili.com';

const apiRoute = {
  /**
   * https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/live/info.md#%E8%8E%B7%E5%8F%96%E6%88%BF%E9%97%B4%E9%A1%B5%E5%88%9D%E5%A7%8B%E5%8C%96%E4%BF%A1%E6%81%AF
   */
  roomInit: '/room/v1/Room/room_init',
  getInfo: '/room/v1/Room/get_info',
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

export interface IRoomInfoResponse {
  code: number;
  msg: string;
  message: string;
  data: {
    room_id: number;
    short_id: number;
    uid: number;
    need_p2p: number;
    is_hidden: boolean;
    is_locked: boolean;
    is_portrait: boolean;
    live_status: number;
    hidden_till: number;
    lock_till: number;
    encrypted: boolean;
    pwd_verified: boolean;
    live_time: number;
    room_shield: number;
    is_sp: number;
    special_type: number;
  };
}

export interface IGetInfoResponse {
  code: number;
  msg: string;
  message: string;
  data: {
    uid: number;
    room_id: number;
    short_id: number;
    attention: number;
    online: number;
    is_portrait: boolean;
    description: string;
    live_status: number;
    area_id: number;
    parent_area_id: number;
    parent_area_name: string;
    old_area_id: number;
    background: string;
    title: string;
    user_cover: string;
    keyframe: string;
    is_strict_room: boolean;
    live_time: number;
    tags: string;
    is_anchor: number;
    room_silent_type: string;
    room_silent_level: number;
    room_silent_second: number;
    area_name: string;
    pendants: string;
    area_pendants: string;
    hot_words: string[];
    hot_words_status: number;
    verify: string;
    new_pendants: {
      frame: any;
      badge: string;
      mobile_frame: any;
      mobile_badge: string;
    };
    up_session: string;
    pk_status: number;
    pk_id: number;
    battle_id: number;
    allow_change_area_time: number;
    allow_upload_cover_time: number;
    studio_info: {
      status: number;
      master_list: any[];
    };
  };
}

export class RoomInfo {
  roomId: number;
  userId: number;
  constructor(data: IRoomInfoResponse) {
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

  async initRoom(roomId: number) {
    const query = {
      id: String(roomId),
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

  async getRoomInfo(roomId: number) {
    const query = {
      room_id: String(roomId),
      ...getCommonQuery(this.appKey),
    } as Record<string, string>;
    query.sign = this.#sign(query);
    const result = await this.#call(apiRoute.getInfo, query);
    console.log(
      `🚀 ~ file: api.ts:98 ~ APIClient ~ getRoomInfo ~ result:`,
      result
    );
    if (result.code !== 0) {
      throw new Error(result.message);
    }
    return result.data as IGetInfoResponse['data'];
  }

  #sign(query: Record<string, string>) {
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
