export class Gift {
  username: string;
  action: string;
  num: number;
  giftName: string;

  constructor(data: IPacketGift) {
    this.username = data.uname;
    this.action = data.action;
    this.num = data.num;
    this.giftName = data.giftName;
  }

  toString() {
    return `${this.username} ${this.action} ${this.num} 个 ${this.giftName}`;
  }
  toJSON(): IGift {
    return {
      username: this.username,
      action: this.action,
      num: this.num,
      giftName: this.giftName,
    };
  }
}

export interface IPacketGift {
  /**
   * @example 投喂
   */
  action: string;
  bag_gift: null;
  batch_combo_id: string;
  batch_combo_send: null;
  beatId: string;
  biz_source: string;
  blind_gift: null;
  broadcast_id: number;
  coin_type: string;
  combo_resources_id: number;
  combo_send: null;
  combo_stay_time: number;
  combo_total_coin: number;
  crit_prob: number;
  demarcation: number;
  discount_price: number;
  dmscore: number;
  draw: number;
  effect: number;
  effect_block: number;
  /**
   * 头像地址
   */
  face: string;
  face_effect_id: number;
  face_effect_type: number;
  float_sc_resource_id: number;
  /**
   * @example 1
   */
  giftId: number;
  /**
   * @example '辣条'
   */
  giftName: string;
  /**
   * @example 5
   */
  giftType: number;
  gold: number;
  guard_level: number;
  is_first: boolean;
  is_join_receiver: boolean;
  is_naming: boolean;
  is_special_batch: number;
  magnification: number;
  medal_info: MedalInfo;
  name_color: string;
  num: number;
  original_gift_name: string;
  /**
   * 价格（单位可能是金瓜子、银瓜子）
   */
  price: number;
  rcost: number;
  receive_user_info: ReceiveUserInfo;
  remain: number;
  rnd: string;
  send_master: null;
  silver: number;
  super: number;
  super_batch_gift_num: number;
  super_gift_num: number;
  svga_block: number;
  switch: boolean;
  tag_image: string;
  tid: string;
  timestamp: number;
  top_list: null;
  /**
   * @example 100
   */
  total_coin: number;
  uid: number;
  uname: string;
}

export interface MedalInfo {
  /**
   * @example 0
   */
  anchor_roomid: number;
  anchor_uname: string;
  guard_level: number;
  icon_id: number;
  is_lighted: number;
  medal_color: number;
  medal_color_border: number;
  medal_color_end: number;
  medal_color_start: number;
  medal_level: number;
  /**
   * @example ''
   */
  medal_name: string;
  special: string;
  target_id: number;
}

export interface ReceiveUserInfo {
  /**
   * @example 17561885
   */
  uid: number;
  /**
   * @example '哔哩哔哩刀塔2赛事'
   */
  uname: string;
}

export interface IGift {
  username: string;
  action: string;
  num: number;
  giftName: string;
}
