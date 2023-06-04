import { IPopularity } from 'common/types/danmaku';
import { PopularityBody } from '../packet';

export class Popularity {
  count: number;
  constructor(info: PopularityBody) {
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
