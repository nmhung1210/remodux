declare module 'remodux' {
  export interface IAction {
    type: string;
  }

  export class Store {
    constructor(reducers?: any, middlewares?: any[]);
    reducers: any;
    middlewares: any[];
    useUndoRedo: boolean;
    getState(): any;
    dispatch(action: IAction | any): any;
    subscribe(listener: any): void;
  }

  export class Reducer {
    constructor(defaultState?: any);
    readonly state: any;
    readonly name: string;
    readonly store: Store;
    protected onReady(): void;
    setState(state: any): void;
  }
}
