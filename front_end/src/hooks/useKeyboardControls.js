import { useEffect } from 'react';
import { ACTIONS } from '../game/game.js';
import { STATUS } from '../game/constants.js';

const KEY_ACTIONS = {
  ArrowLeft: ACTIONS.MOVE_LEFT,
  ArrowRight: ACTIONS.MOVE_RIGHT,
  ArrowDown: ACTIONS.SOFT_DROP,
  ArrowUp: ACTIONS.ROTATE,
  KeyX: ACTIONS.ROTATE,
  Space: ACTIONS.HARD_DROP,
  KeyC: ACTIONS.HOLD,
  ShiftLeft: ACTIONS.HOLD,
  KeyP: ACTIONS.TOGGLE_PAUSE,
  Escape: ACTIONS.TOGGLE_PAUSE,
};

// 키를 누르고 있을 때 반복 입력되면 안 되는 동작
const NO_REPEAT = new Set([ACTIONS.ROTATE, ACTIONS.HARD_DROP, ACTIONS.HOLD, ACTIONS.TOGGLE_PAUSE]);

export function useKeyboardControls(dispatch, status, onStart) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement) return;

      if (event.code === 'Enter' && (status === STATUS.READY || status === STATUS.OVER)) {
        event.preventDefault();
        onStart();
        return;
      }

      const type = KEY_ACTIONS[event.code];
      if (!type) return;

      event.preventDefault();
      if (event.repeat && NO_REPEAT.has(type)) return;
      dispatch({ type });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, status, onStart]);
}
