import { IPopularity } from 'common/types/danmaku';

export interface IPopularityBody {
  count: number;
}

export class Popularity {
  count: number;
  constructor(info: IPopularityBody) {
    this.count = info.count;
  }
  toString() {
    return `当前人气值: ${this.count}`;
  }
  toJSON(): IPopularity {
    return {
      count: this.count,
    };
  }
}
