import { createStore, combineReducers, compose } from 'redux';
import {
  reduceUndoRedo,
  rootReduceUndoRedo,
  undoRedoMiddleware
} from './undoRedo';
export default class Store {
  constructor(reducers = {}, middlewares = []) {
    this.reducers = reducers;
    this.store = createStore(
      (state, action) => this.reducer(state, action),
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    );
    this._dispatch = this.store.dispatch;
    this.store.dispatch = this.dispatch.bind(this);
    this.middlewares = middlewares;
  }

  set reducers(val) {
    this._reducers = val;
    this.replaceReducer();
  }

  replaceReducer() {
    this.reducer = (state = {}, action) => {
      return compose(...this.rootReducers)({
        state: combineReducers(this.reducers)(state, action),
        action
      }).state;
    };
  }

  get reducers() {
    return this._reducers || {};
  }

  set rootReducers(val) {
    this._rootReducers = val;
    this.replaceReducer();
  }

  get rootReducers() {
    return this._rootReducers || [];
  }

  get useUndoRedo() {
    return !!this._useUndoRedo;
  }

  set useUndoRedo(val) {
    if (val === this.useUndoRedo) return;
    if (val) {
      const reducers = this.reducers;
      const rootReducers = this.rootReducers;
      const middlewares = this.middlewares;
      this.reducers = {
        ...reducers,
        undoRedo: reduceUndoRedo
      };
      this.middlewares = [undoRedoMiddleware, ...middlewares];
      this.rootReducers = [rootReduceUndoRedo, ...rootReducers];
    } else if (this.useUndoRedo) {
      const { undoRedo, ...reducers } = this.reducers;
      this.reducers = reducers;
      this.rootReducers = this.rootReducers.filter(
        reducer => reducer !== rootReduceUndoRedo
      );
      this.middlewares = this.middlewares.filter(
        middleware => middleware !== undoRedoMiddleware
      );
    }
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
    dispatch = compose(...chain)(this._dispatch);
    this.middleware = dispatch;
  }

  get middlewares() {
    return this._middlewares || [];
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
