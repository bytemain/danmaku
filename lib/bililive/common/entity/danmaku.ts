export interface IMedal {
  name: string;
  level: string;
  baseColor: number;
  upName: string;
  borderColor: number;
  nextColor: number;
  guardLevel: number;
}

export interface IDanmaku {
  uid: number;
  createdAt: number;
  username: string;
  content: string;
  medal: IMedal;
  level: string;
  levelColor: number;
}

export class Danmaku {
  username: string;
  uid: number;
  content: string;
  medal: IMedal;
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
        upName: info[3][2],
        baseColor: info[3][4],
        borderColor: info[3][7],
        nextColor: info[3][9],
        guardLevel: info[3][10],
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
