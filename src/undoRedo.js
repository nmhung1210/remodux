const past = [];
const future = [];

export const undoRedoMiddleware = ({ getState, dispatch }) => {
  return next => action => {
    const currentState = getState();
    switch (action.type) {
      case 'UNDO':
        if (past.length) {
          action.state = past.pop();
          future.unshift(currentState);
        }
        break;
      case 'REDO':
        if (future.length) {
          action.state = future.shift();
          past.push(currentState);
        }
        break;
      case 'RESET_UNDO':
        past.length = 0;
        break;
      case 'RESET_REDO':
        future.length = 0;
        break;
      case 'RESET_UNDO_REDO':
        past.length = 0;
        future.length = 0;
        break;
      default:
        past.push(getState());
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
      if (action.state) {
        return {
          state: {
            ...action.state
          },
          action
        };
      }
      return { state, action };
    default:
      return { state, action };
  }
};

export const reduceUndoRedo = (
  state = { undoable: false, redoable: false },
  action
) => {
  return {
    undoable: past.length > 0,
    redoable: future.length > 0
  };
};
