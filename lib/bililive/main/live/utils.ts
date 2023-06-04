export class LimitedArray<T> extends Array<T> {
  constructor(private limit: number) {
    super();
  }

  push(...items: T[]): number {
    if (this.length + items.length > this.limit) {
      this.splice(0, this.length + items.length - this.limit);
    }
    return super.push(...items);
  }
}
