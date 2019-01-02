const globalStack = {};
const globalConfig = {};

const isAllowed = key => {
  return globalConfig[key] || false;
};

const getStack = key => {
  if (!globalStack[key]) {
    globalStack[key] = {
      past: [],
      future: []
    };
  }
  return globalStack[key];
};

export const undoRedoMiddleware = ({ getState, dispatch }) => {
  return next => action => {
    const currentState = getState();
    switch (action.type) {
      case 'UNDO':
        {
          if (!isAllowed(action.reducer)) break;
          const { past, future } = getStack(action.reducer);
          const state = currentState[action.reducer];
          if (past.length) {
            action.state = {
              ...past.pop(),
              undoable: past.length > 0,
              redoable: true
            };
            future.unshift(state);
          }
        }
        break;
      case 'REDO':
        {
          if (!isAllowed(action.reducer)) break;
          const { past, future } = getStack(action.reducer);
          const state = currentState[action.reducer];
          if (future.length) {
            action.state = {
              ...future.shift(),
              undoable: true,
              redoable: future.length > 0
            };
            past.push(state);
          }
        }
        break;
      case 'RESET_UNDO':
        {
          if (!isAllowed(action.reducer)) break;
          const { past } = getStack(action.reducer);
          const state = currentState[action.reducer];
          if (state.undoable) {
            past.length = 0;
            action.state = {
              ...state,
              undoable: false
            };
          }
        }
        break;
      case 'RESET_REDO':
        {
          if (!isAllowed(action.reducer)) break;
          const { future } = getStack(action.reducer);
          const state = currentState[action.reducer];
          if (state.redoable) {
            future.length = 0;
            action.state = {
              ...state,
              redoable: false
            };
          }
        }
        break;
      case 'RESET_UNDO_REDO':
        {
          if (!isAllowed(action.reducer)) break;
          const { past, future } = getStack(action.reducer);
          const state = currentState[action.reducer];
          if (state.undoable || state.redoable) {
            past.length = 0;
            future.length = 0;
            action.state = {
              ...state,
              undoable: false,
              redoable: false
            };
          }
        }
        break;
      case 'USE_UNDO_REDO':
        globalConfig[action.reducer] = true;
        const { past, future } = getStack(action.reducer);
        const state = currentState[action.reducer];
        past.length = 0;
        future.length = 0;
        action.state = {
          ...state,
          undoable: false,
          redoable: false
        };
        break;
      default:
        const [reducerName, actionType = ''] = action.type.split('.');
        if (currentState[reducerName] && actionType) {
          switch (actionType) {
            case 'undo':
              return dispatch({ type: 'UNDO', reducer: reducerName });
            case 'redo':
              return dispatch({ type: 'REDO', reducer: reducerName });
            case 'resetUndo':
              return dispatch({ type: 'RESET_UNDO', reducer: reducerName });
            case 'resetRedo':
              return dispatch({ type: 'RESET_REDO', reducer: reducerName });
            case 'resetUndoRedo':
              return dispatch({
                type: 'RESET_UNDO_REDO',
                reducer: reducerName
              });
            case 'useUndoRedo':
              return dispatch({ type: 'USE_UNDO_REDO', reducer: reducerName });
            default:
              break;
          }
        }
        for (const reducer in currentState) {
          if (currentState.hasOwnProperty(reducer) && isAllowed(reducer)) {
            const state = currentState[reducer];
            const { past } = getStack(reducer);
            const needUpdateUndoable = past.length <= 0;
            if (needUpdateUndoable || state !== past[past.length - 1]) {
              past.push(state);
            }
            if (needUpdateUndoable) {
              dispatch({ type: 'UNDOABLE', reducer });
            }
          }
        }
        break;
    }
    return next(action);
  };
};

export const rootReduceUndoRedo = action => state => {
  if (!action.type) return state;
  switch (action.type) {
    case 'UNDO':
    case 'REDO':
    case 'RESET_UNDO':
    case 'RESET_REDO':
    case 'RESET_UNDO_REDO':
    case 'USE_UNDO_REDO':
      if (action.state && action.reducer && isAllowed(action.reducer)) {
        state = {
          ...state,
          [action.reducer]: action.state
        };
      }
      break;
    case 'UNDOABLE':
      {
        const reducerState = state[action.reducer];
        if (!reducerState.undoable) {
          state = {
            ...state,
            [action.reducer]: {
              ...reducerState,
              undoable: true
            }
          };
        }
      }
      break;
    default:
      break;
  }
  return state;
};
