export interface IPacketPayload {
  packetLen: number;
  headerLen: number;
  ver: number;
  op: number;
  seq: number;
  body: any;
}

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
   * - 在本房间续费了舰长
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

  // --- 礼物相关

  /**
   * 投喂礼物
   */
  SEND_GIFT = 'SEND_GIFT',
  /**
   * 连击礼物
   */
  COMBO_SEND = 'COMBO_SEND',

  // --- 天选之人

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

  // --- 舰长相关

  /**
   * 上舰长
   */
  GUARD_BUY = 'GUARD_BUY',
  /**
   * 续费了舰长
   */
  USER_TOAST_MSG = 'USER_TOAST_MSG',

  // --- banner 相关

  /**
   * 小时榜变动
   */
  ACTIVITY_BANNER_UPDATE_V2 = 'ACTIVITY_BANNER_UPDATE_V2',

  // --- 粉丝相关

  /**
   * 粉丝关注变动
   */
  ROOM_REAL_TIME_MESSAGE_UPDATE = 'ROOM_REAL_TIME_MESSAGE_UPDATE',
}
