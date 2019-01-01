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

  validateReducers(val) {
    const reducers = {};
    // Adding support for Reducer instances.
    for (const key in val) {
      if (val.hasOwnProperty(key)) {
        const reducer = val[key];
        if (reducer.isReducerInstance) {
          reducers[key] = reducer.reduce.bind(reducer);
        } else if (typeof reducer === 'function') {
          reducers[key] = reducer;
        } else {
          throw new Error(
            `Invalid reducer ${key}! Reducer should be a function!`
          );
        }

        if (typeof reducers[key](undefined, {}) !== 'object') {
          throw new Error(
            `Invalid reducer ${key}! Reducer must return state object!`
          );
        }
      }
    }
    return reducers;
  }

  set reducers(val) {
    this._reducers = this.validateReducers(val);
    this.replaceReducer();
  }

  replaceReducer() {
    this.reducer = (state = {}, action) => {
      return compose(
        ({ state, action }) => state,
        ...this.rootReducers
      )({
        state: combineReducers(this.reducers)(state, action),
        action
      });
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
    return this._useUndoRedo;
  }

  // Config can be boolean for all keys. Or array of keys.
  set useUndoRedo(config) {
    if (config === this.useUndoRedo) return;
    if (config && !this.useUndoRedo) {
      const reducers = this.reducers;
      const rootReducers = this.rootReducers;
      const middlewares = this.middlewares;
      this.reducers = {
        ...reducers,
        undoRedo: reduceUndoRedo
      };
      this.middlewares = [undoRedoMiddleware, ...middlewares];
      this.rootReducers = [rootReduceUndoRedo, ...rootReducers];
    }
    this.dispatch({ type: 'USE_UNDO_REDO', config });

    if (!config && this.useUndoRedo) {
      // Remove undo redo handles
      this.rootReducers = this.rootReducers.filter(
        reducer => reducer !== rootReduceUndoRedo
      );
      this.middlewares = this.middlewares.filter(
        middleware => middleware !== undoRedoMiddleware
      );
    }
    this._useUndoRedo = config;
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

    this._dispatchChain = action => {
      if (
        (typeof action === 'object' || typeof action === 'function') &&
        typeof action.then === 'function'
      ) {
        // Adding support for redux-promise
        return action.then(dispatch);
      } else if (typeof action === 'function') {
        // Adding support for redux-thunk
        return action(dispatch, this.store.getState);
      }
      return dispatch(action);
    };
  }

  get middlewares() {
    return this._middlewares || [];
  }

  dispatch(action) {
    return this._dispatchChain(action);
  }

  subscribe(listener) {
    this.store.subscribe(listener);
  }

  getState() {
    return this.store.getState();
  }
}
