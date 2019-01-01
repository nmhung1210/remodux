import { Store, Reducer } from '../src/index';

class UserReducer extends Reducer {
  constructor() {
    super('user', {
      name: 'Test User'
    });
  }

  changeName({ name }) {
    this.setState({ name });
  }
}

const store = new Store({
  user: new UserReducer()
});

describe('Reducer Object', () => {
  it('UserReducer', () => {
    expect(store.getState().user).toEqual({ name: 'Test User' });
    store.dispatch({ type: 'user.changeName', name: 'New User' });
    expect(store.getState().user).toEqual({ name: 'New User' });
  });
});
