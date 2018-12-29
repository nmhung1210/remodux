import { Store } from '../src/index';

const store = new Store(
  {
    user: (state = { name: 'Test User' }, action) => {
      switch (action.type) {
        case 'CHANGE_NAME':
          return {
            ...state,
            name: action.name
          };
        default:
          return state;
      }
    }
  },
  [
    ({ getState, dispatch }) => next => action => {
      if (action.type === 'CHANGE_NAME_MIDDLE') {
        action.type = 'CHANGE_NAME';
      }
      return next(action);
    },
    ({ getState, dispatch }) => next => action => {
      if (action.type === 'CHANGE_NAME_ASYNC') {
        const newAction = {
          ...action,
          type: 'CHANGE_NAME'
        };
        setTimeout(() => dispatch(newAction), 100);
      }
      return next(action);
    }
  ]
);

store.subscribe(() => {
  console.log('subscribe', store.getState());
});

store.useUndoRedo = true;

describe('Reducer', () => {
  it('Test Reducer', () => {
    expect(store.getState().user).toEqual({ name: 'Test User' });
    store.dispatch({ type: 'CHANGE_NAME', name: 'New User' });
    expect(store.getState().user).toEqual({ name: 'New User' });

    store.dispatch({ type: 'CHANGE_NAME_MIDDLE', name: 'AAAA' });
    expect(store.getState().user).toEqual({ name: 'AAAA' });
  });
});

describe('Middleware', () => {
  it('Test Middleware', () => {
    store.dispatch({ type: 'CHANGE_NAME_MIDDLE', name: 'AAAA' });
    expect(store.getState().user).toEqual({ name: 'AAAA' });

    store.dispatch({ type: 'CHANGE_NAME_ASYNC', name: 'CCCC' });
    expect(store.getState().user).toEqual({ name: 'AAAA' });
  });

  it('Test Middleware ASYNC', () => {
    return new Promise(resolve => {
      setTimeout(() => resolve(store.getState().user), 1001);
    }).then(user => expect(user).toEqual({ name: 'CCCC' }));
  });
});

describe('UndoRedo', () => {
  it('Test UndoRedo', () => {
    store.useUndoRedo = true;
    store.dispatch({ type: 'CHANGE_NAME_MIDDLE', name: 'AAAA1111' });
    expect(store.getState().user).toEqual({ name: 'AAAA1111' });

    store.dispatch({ type: 'CHANGE_NAME_MIDDLE', name: 'AAAA2222' });
    expect(store.getState().user).toEqual({ name: 'AAAA2222' });

    store.dispatch({ type: 'UNDO', key: 'user' });
    expect(store.getState().user).toEqual({ name: 'AAAA1111' });

    store.dispatch({ type: 'REDO', key: 'user' });
    expect(store.getState().user).toEqual({ name: 'AAAA2222' });

    store.useUndoRedo = {
      user: false
    };
    store.dispatch({ type: 'CHANGE_NAME_MIDDLE', name: 'BBB' });
    expect(store.getState().user).toEqual({ name: 'BBB' });

    store.dispatch({ type: 'UNDO', key: 'user' });
    expect(store.getState().user).toEqual({ name: 'BBB' });

    expect(store.getState().undoRedo.user).toEqual({
      undoable: false,
      redoable: false
    });
  });
});
