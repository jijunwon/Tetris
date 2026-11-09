import { useCallback, useReducer } from 'react';
import { ACTIONS, createInitialState, gameReducer } from '../game/game.js';
import { STATUS, getDropInterval } from '../game/constants.js';
import { useGameLoop } from './useGameLoop.js';
import { useKeyboardControls } from './useKeyboardControls.js';

export function useTetris(canPlay = true) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(Date.now()),
  );

  const start = useCallback(() => dispatch({ type: ACTIONS.START, seed: Date.now() }), []);
  const reset = useCallback(() => dispatch({ type: ACTIONS.RESET, seed: Date.now() }), []);
  const togglePause = useCallback(() => dispatch({ type: ACTIONS.TOGGLE_PAUSE }), []);
  const tick = useCallback(() => dispatch({ type: ACTIONS.TICK }), []);

  useGameLoop(tick, getDropInterval(state.level), state.status === STATUS.PLAYING);
  useKeyboardControls(dispatch, state.status, start, canPlay);

  return { state, start, reset, togglePause };
}
