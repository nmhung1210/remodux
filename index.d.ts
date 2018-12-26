declare module 'remodux' {
  export default class Store {
    constructor(reducer?: any, middlewares?: any[]);
    reducers: any;
    middlewares: any[];
    getState(): any;
    dispatch(): any;
    subscribe(listener: any): void;
  }
}
