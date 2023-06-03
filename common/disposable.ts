export interface IDisposable {
  dispose(): void;
}

export class Disposable implements IDisposable {
  #disposables = [] as IDisposable[];

  add(...disposables: IDisposable[]) {
    if (disposables.length > 1) {
      const disposable = new Disposable();
      disposable.#disposables.push(...disposables);
      return this.add(disposable);
    }
    const [disposable] = disposables;
    if (!disposable || !disposable.dispose) {
      return false;
    }

    this.#disposables.push(disposable);
    return {
      dispose: () => {
        var i = this.#disposables.indexOf(disposable);
        if (i > -1) this.#disposables.splice(i, 1);
      },
    };
  }

  // #disposed = false;
  // get disposed() {
  //   return this.#disposed;
  // }
  dispose() {
    for (let index = this.#disposables.length; index--; ) {
      this.#disposables[index].dispose();
    }
    // this.#disposed = true;
    this.#disposables = [];
  }

  static create(func: () => void) {
    return {
      dispose: () => {
        func();
      },
    } as IDisposable;
  }
}
