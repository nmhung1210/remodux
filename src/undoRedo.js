const globalStack = {};
let config = false;

const isAllowed = key => {
  if (key === 'undoRedo') return false; // reserve key.
  if (config === false) return false;
  if (config === true) return true;
  return config[key] || false;
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
          if (!isAllowed(action.key)) break;
          const { past, future } = getStack(action.key);
          const state = currentState[action.key];
          if (past.length) {
            action.state = past.pop();
            future.unshift(state);
          }
        }
        break;
      case 'REDO':
        {
          if (!isAllowed(action.key)) break;
          const { past, future } = getStack(action.key);
          const state = currentState[action.key];
          if (future.length) {
            action.state = future.shift();
            past.push(state);
          }
        }
        break;
      case 'RESET_UNDO':
        {
          if (!isAllowed(action.key)) break;
          const { past } = getStack(action.key);
          past.length = 0;
        }
        break;
      case 'RESET_REDO':
        {
          if (!isAllowed(action.key)) break;
          const { future } = getStack(action.key);
          future.length = 0;
        }
        break;
      case 'RESET_UNDO_REDO':
        {
          if (!isAllowed(action.key)) break;
          const { past, future } = getStack(action.key);
          past.length = 0;
          future.length = 0;
        }
        break;
      case 'USE_UNDO_REDO':
        {
          if (typeof action.config === 'boolean') {
            config = action.config;
          } else if (Array.isArray(action.config)) {
            config = {};
            action.config.forEach(key => {
              config[key] = true;
            });
          } else if (typeof action.config === 'object') {
            config = {
              ...action.config
            };
          }
          for (const key in globalStack) {
            if (globalStack.hasOwnProperty(key) && !isAllowed(key)) {
              delete globalStack[key];                            
            }
          }
        }
        break;
      default:
        {
          const { undoRedo, ...states } = currentState;
          for (const key in states) {
            if (states.hasOwnProperty(key) && isAllowed(key)) {
              const state = states[key];
              const { past } = getStack(key);
              if (past.length <= 0 || state !== past[past.length - 1]) {
                past.push(state);
              }
            }
          }
        }
        break;
    }
    return next(action);
  };
};

export const rootReduceUndoRedo = ({ state, action }) => {
  if (!action.type) return { state, action };
  switch (action.type) {
    case 'UNDO':
    case 'REDO':
      if (action.state && action.key && isAllowed(action.key)) {
        state[action.key] = action.state;
      }
      break;
    default:
      break;
  }
  return {
    state,
    action
  };
};

export const reduceUndoRedo = (state = {}, action) => {
  for (const key in globalStack) {
    if (globalStack.hasOwnProperty(key)) {
      let undoable = false;
      let redoable = false;
      if (isAllowed(key)) {
        const { past, future } = globalStack[key];
        undoable = past.length > 0;
        redoable = future.length > 0;
      }
      if (
        !state[key] ||
        state[key].undoable !== undoable ||
        state[key].redoable !== redoable
      ) {
        state = {
          ...state,
          [key]: {
            undoable,
            redoable
          }
        };
      }
    }
  }
  return state;
};
