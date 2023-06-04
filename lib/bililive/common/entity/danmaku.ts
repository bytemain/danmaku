export interface IDanmaku {
  uid: number;
  createdAt: number;
  username: string;
  content: string;
  medal: { name: string; level: string; color: number };
  level: string;
  levelColor: number;
}

export class Danmaku {
  username: string;
  uid: number;
  content: string;
  medal: { name: string; level: string; color: number };
  level: string;
  levelColor: number;

  createdAt: number;

  constructor(info: any) {
    this.createdAt = info[0][4];
    this.uid = info[2][0];
    this.username = info[2][1];
    this.content = info[1];

    this.level = info[4][0];
    this.levelColor = info[4][2];
    this.medal = {} as any;
    if (info[3].length > 0) {
      this.medal = {
        level: info[3][0],
        name: info[3][1],
        color: info[3][2],
      };
    }
  }

  toString() {
    return `${this.username} ${this.content}`;
  }

  toJSON(): IDanmaku {
    return {
      createdAt: this.createdAt,
      username: this.username,
      uid: this.uid,
      content: this.content,
      medal: this.medal,
      level: this.level,
      levelColor: this.levelColor,
    };
  }
}
