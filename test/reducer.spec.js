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
  user: new UserReducer(),
  profile: {
    defaultState: {
      avatar: 'None'
    },
    CHANGE_AVATAR: (state, { avatar }) => {
      return {
        ...state,
        avatar
      };
    }
  }
});

describe('Reducer Object', () => {
  it('UserReducer', () => {
    expect(store.getState().user).toEqual({ name: 'Test User' });
    expect(store.getState().profile).toEqual({ avatar: 'None' });

    store.dispatch({ type: 'user.changeName', name: 'New User' });
    expect(store.getState().user).toEqual({ name: 'New User' });

    store.dispatch({ type: 'profile.CHANGE_AVATAR', avatar: 'AAA.png' });
    expect(store.getState().profile).toEqual({ avatar: 'AAA.png' });
  });

  it('UserReducer Undo', () => {
    store.dispatch({ type: 'user.useUndoRedo' });
    expect(store.getState().user).toEqual({
      name: 'New User',
      undoable: false,
      redoable: false
    });

    store.dispatch({ type: 'user.changeName', name: 'A1' });
    expect(store.getState().user).toEqual({
      name: 'A1',
      undoable: true,
      redoable: false
    });

    store.dispatch({ type: 'user.changeName', name: 'A2' });
    expect(store.getState().user).toEqual({
      name: 'A2',
      undoable: true,
      redoable: false
    });

    store.dispatch({ type: 'user.undo' });
    expect(store.getState().user).toEqual({
      name: 'A1',
      undoable: true,
      redoable: true
    });

    store.dispatch({ type: 'user.undo' });
    expect(store.getState().user).toEqual({
      name: 'New User',
      undoable: false,
      redoable: true
    });

    store.dispatch({ type: 'user.undo' });
    expect(store.getState().user).toEqual({
      name: 'New User',
      undoable: false,
      redoable: true
    });

    store.dispatch({ type: 'user.redo' });
    expect(store.getState().user).toEqual({
      name: 'A1',
      undoable: true,
      redoable: true
    });

    store.dispatch({ type: 'user.redo' });
    expect(store.getState().user).toEqual({
      name: 'A2',
      undoable: true,
      redoable: false
    });

    store.dispatch({ type: 'user.redo' });
    expect(store.getState().user).toEqual({
      name: 'A2',
      undoable: true,
      redoable: false
    });
  });
});
