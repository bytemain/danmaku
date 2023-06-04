export interface IGift {
  username: string;
  action: string;
  num: number;
  giftName: string;
}

export interface IWelcome {
  username: string;
  uid: string;
  type: string;
}

export interface IDanmaku {
  createdAt: number;
  username: string;
  content: string;
  medal: { name: string; level: string; color: string };
  level: string;
  levelColor: string;
}

export interface IPopularity {
  count: number;
}

export const enum EDanmakuEventName {
  POPULARITY = 'popularity',
  DANMAKU = 'danmaku',
  GIFT = 'gift',
  WELCOME = 'welcome',
}
