declare module 'remodux' {
  export class Store {
    constructor(reducer?: any, middlewares?: any[]);
    reducers: any;
    middlewares: any[];
    useUndoRedo: boolean;
    getState(): any;
    dispatch(): any;
    subscribe(listener: any): void;
  }
}
