export interface IPacketPopularity {
  count: number;
}

export interface IPopularity {
  count: number;
}

export class Popularity {
  count: number;
  constructor(info: IPacketPopularity) {
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
