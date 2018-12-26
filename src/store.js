import { createStore, combineReducers, compose } from 'redux';

export default class Store {
  constructor(reducers = {}, middlewares = []) {
    this.reducers = reducers;
    this.store = createStore(this.reducerRoot.bind(this));
    this.middlewares = middlewares;
  }

  set reducers(val) {
    this._reducers = val;
    this.reducer = combineReducers(this.reducers);
  }

  get reducers() {
    return this._reducers || {};
  }

  set middlewares(val) {
    this._middlewares = val;
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      );
    };

    const middlewareAPI = {
      getState: this.store.getState,
      dispatch: (...args) => dispatch(...args)
    };
    const chain = this.middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(this.store.dispatch);
    this.middleware = dispatch;
  }

  get middlewares() {
    return this._middlewares || [];
  }

  reducerRoot(state = {}, action = {}) {
    return this.reducer(state, action);
  }

  dispatch(action) {
    return this.middleware(action);
  }

  subscribe(listener) {
    this.store.subscribe(listener);
  }

  getState() {
    return this.store.getState();
  }
}
