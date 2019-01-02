import { Store, Reducer } from '../src/index';

class UserReducer extends Reducer {
  constructor() {
    super({
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

describe('Redux Promise', () => {
  it('dispatch function', () => {
    expect(store.getState().user).toEqual({ name: 'Test User' });
    store.dispatch(
      new Promise(resolve => {
        setTimeout(
          () =>
            resolve({
              type: 'user.changeName',
              name: 'AAA'
            }),
          1000
        );
      })
    );
    expect(store.getState().user).toEqual({ name: 'Test User' });
  });

  it('check dispatch function result', () => {
    return new Promise(resolve => {
      setTimeout(() => resolve(store.getState().user), 1001);
    }).then(user => expect(user).toEqual({ name: 'AAA' }));
  });
});
