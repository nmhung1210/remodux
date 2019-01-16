export class Reducer {
  constructor(state = {}) {
    this._state = state;
    this._store = null;
    this._name = null;
  }

  get state() {
    return this._state;
  }

  set state(val) {
    throw new Error(
      `Property state is readonly! Use setState() method instead!`
    );
  }

  get isReducerInstance() {
    return true;
  }

  get name() {
    return this._name;
  }

  set name(val) {
    throw new Error(`Property name is readonly!`);
  }

  setState(state) {
    const newState = {
      ...this.state,
      ...state
    };
    for (const key in state) {
      if (state.hasOwnProperty(key)) {
        const element = state[key];
        if (element !== this.state[key]) {
          this._state = newState;
          return;
        }
      }
    }
  }

  connectStore(store, name) {
    if (this._store) {
      throw new Error('Store already connected!');
    }
    this._store = store;
    this._name = name;
    this.onReady();
  }

  get store() {
    return this._store;
  }

  set store(val) {
    throw new Error('Store is readonly!');
  }

  onReady() {}

  reduce(state, action) {
    this._state = state || this.state;
    const { type = '' } = action;
    const [name, fname] = type.split('.');
    if (this.name === name && typeof this[fname] === 'function') {
      if (
        fname === 'name' ||
        fname === 'state' ||
        fname === 'setState' ||
        fname === 'isReducerInstance' ||
        fname === 'connectStore' ||
        fname === 'onReady' ||
        fname === 'reduce'
      ) {
        throw new Error(
          `Action type ${fname} was reserved! Please use another type instead!`
        );
      }
      this[fname](action);
    }
    return this.state;
  }
}

Reducer.createFromObject = obj => {
  const { defaultState = {}, ...handles } = obj;
  return reducerName => (state = defaultState, action) => {
    const { type = '' } = action;
    const [name, fname] = type.split('.');
    if (reducerName === name && typeof handles[fname] === 'function') {
      const newState = handles[fname](state, action);
      if (newState && newState !== state) {
        state = newState;
      }
    }
    return state;
  };
};

export default Reducer;
