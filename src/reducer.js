export class Reducer {
  constructor(name, state = {}) {
    this._name = name;
    this._state = state;
  }

  get name() {
    return this._name;
  }

  get state() {
    return this._state;
  }

  get isReducerInstance() {
    return true;
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

  reduce(state, action) {
    this._state = state || this.state;
    const { type = '' } = action;
    const [name, fname] = type.split('.');
    if (this.name === name && typeof this[fname] === 'function') {
      this[fname](action);
    }
    return this.state;
  }
}

export default Reducer;
