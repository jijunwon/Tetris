import { useEffect, useRef, useState } from 'react';
import { STATUS } from '../game/constants.js';

const UPDATE_INTERVAL = 100;

// 게임 진행 중에만 흐르는 시간(ms). 일시정지하면 멈추고, 게임 오버면 그 시간에서 멈춘다.
// 시작 전(READY)이나 새 게임(READY·OVER → PLAYING)이면 0부터 다시 잰다.
export function useElapsedTime(status) {
  const [elapsed, setElapsed] = useState(0);
  const accumulated = useRef(0);
  const previousStatus = useRef(status);

  useEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = status;

    if (status === STATUS.READY || (status === STATUS.PLAYING && previous !== STATUS.PAUSED)) {
      accumulated.current = 0;
      setElapsed(0);
    }
    if (status !== STATUS.PLAYING) return undefined;

    const startedAt = performance.now();
    const id = setInterval(() => {
      setElapsed(accumulated.current + performance.now() - startedAt);
    }, UPDATE_INTERVAL);

    return () => {
      clearInterval(id);
      accumulated.current += performance.now() - startedAt;
      setElapsed(accumulated.current);
    };
  }, [status]);

  return elapsed;
}
