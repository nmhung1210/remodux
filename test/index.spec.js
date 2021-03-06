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
  it('UndoRedo Setup', () => {
    store.dispatch({ type: 'USE_UNDO_REDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'CCCC',
      undoable: false,
      redoable: false
    });

    store.dispatch({ type: 'CHANGE_NAME_MIDDLE', name: 'AAAA1111' });
    expect(store.getState().user).toEqual({
      name: 'AAAA1111',
      undoable: true,
      redoable: false
    });

    store.dispatch({ type: 'CHANGE_NAME_MIDDLE', name: 'AAAA2222' });
    expect(store.getState().user).toEqual({
      name: 'AAAA2222',
      undoable: true,
      redoable: false
    });

    store.dispatch({ type: 'UNDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA1111',
      undoable: true,
      redoable: true
    });

    store.dispatch({ type: 'REDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA2222',
      undoable: true,
      redoable: false
    });

    store.dispatch({ type: 'UNDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA1111',
      undoable: true,
      redoable: true
    });

    store.dispatch({ type: 'UNDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'CCCC',
      undoable: false,
      redoable: true
    });

    store.dispatch({ type: 'UNDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'CCCC',
      undoable: false,
      redoable: true
    });

    store.dispatch({ type: 'UNDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'CCCC',
      undoable: false,
      redoable: true
    });

    store.dispatch({ type: 'REDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA1111',
      undoable: true,
      redoable: true
    });

    store.dispatch({ type: 'REDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA2222',
      undoable: true,
      redoable: false
    });

    store.dispatch({ type: 'REDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA2222',
      undoable: true,
      redoable: false
    });

    store.dispatch({ type: 'REDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA2222',
      undoable: true,
      redoable: false
    });

    store.dispatch({ type: 'RESET_UNDO_REDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA2222',
      undoable: false,
      redoable: false
    });

    store.dispatch({ type: 'UNDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA2222',
      undoable: false,
      redoable: false
    });

    store.dispatch({ type: 'REDO', reducer: 'user' });
    expect(store.getState().user).toEqual({
      name: 'AAAA2222',
      undoable: false,
      redoable: false
    });
  });
});
