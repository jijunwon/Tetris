import { STATUS } from '../game/constants.js';

// 게임 상태가 바뀐 전후를 비교해서 울릴 효과음 목록을 만든다. 새 판이 시작된 순간은 비교하지 않는다.
export function getSoundEvents(prev, next) {
  if (!prev || prev === next || prev.gameId !== next.gameId) return [];

  const events = [];
  const locked = next.lockCount > prev.lockCount;

  if (locked) {
    events.push({ type: next.hardDropCount > prev.hardDropCount ? 'hardDrop' : 'lock' });
  } else if (prev.canHold && !next.canHold) {
    events.push({ type: 'hold' });
  } else if (prev.current && next.current) {
    if (next.current.shape !== prev.current.shape) events.push({ type: 'rotate' });
    else if (next.current.x !== prev.current.x) events.push({ type: 'move' });
  }

  const clear = next.lastClear;
  if (clear && clear !== prev.lastClear) {
    events.push({ type: 'clear', cleared: clear.cleared, tSpin: clear.tSpin, combo: clear.combo });
    if (clear.levelUp) events.push({ type: 'levelUp' });
  }

  if (next.status === STATUS.OVER && prev.status !== STATUS.OVER) events.push({ type: 'gameOver' });
  return events;
}
