export class Welcome {
  username: string;
  uid: string;
  constructor(info: IPacketWelcome) {
    this.username = info.uname;
    this.uid = info.uid;
  }
  toString() {
    return `欢迎 ${this.username} 进入直播间`;
  }
  toJSON(): IWelcome {
    return {
      username: this.username,
      uid: this.uid,
    };
  }
}

export interface IWelcome {
  username: string;
  uid: string;
}
export interface IPacketWelcome {
  uname: string;
  uid: string;
}
