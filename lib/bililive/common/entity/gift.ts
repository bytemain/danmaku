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
  uname: string;
  action: string;
  num: number;
  giftName: string;
}

export interface IGift {
  username: string;
  action: string;
  num: number;
  giftName: string;
}
