export class Deferred {
  public promise: Promise<any>;
  public resolve: (...args: any[]) => any;
  public reject: (...args: any[]) => any;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export function defer() {
  return new Deferred();
}
