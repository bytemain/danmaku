export interface IDanmaku {
  uid: number;
  createdAt: number;
  username: string;
  content: string;
  medal: { name: string; level: string; color: number };
  level: string;
  levelColor: string;
}

/**
 * [
    [
      0,             1,
      25,            16772431,
      1685811008135, 1685810729,
      0,             '1cc0812a',
      0,             0,
      0,             '',
      0,             '{}',
      '{}',          [Object],
      [Object]
    ],
    '333',
    [ Redacted, 'Bilibili直播姬', 0, 0, 0, 10000, 1, '' ],
    [],
    [ 22, 0, 5805790, '>50000', 0 ],
    [ '', '' ],
    0,
    0,
    null,
    { ts: 1685811008, ct: '5C425267' },
    0,
    0,
    null,
    null,
    0,
    210
  ]
 */
export class Danmaku {
  username: string;
  uid: number;
  content: string;
  medal: { name: string; level: string; color: number };
  level: string;
  levelColor: string;

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
