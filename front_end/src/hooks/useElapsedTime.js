import { useEffect, useRef, useState } from 'react';
import { STATUS } from '../game/constants.js';

const UPDATE_INTERVAL = 100;

// 게임 진행 중에만 흐르는 시간(ms). 일시정지하면 멈추고, 게임 오버면 그 시간에서 멈춘다.
// 새 판(gameId가 바뀜)이면 0부터 다시 잰다. 일시정지 중에 바로 새 판을 시작해도 초기화된다.
export function useElapsedTime(status, gameId) {
  const [elapsed, setElapsed] = useState(0);
  const accumulated = useRef(0);

  useEffect(() => {
    accumulated.current = 0;
    setElapsed(0);
  }, [gameId]);

  useEffect(() => {
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
  }, [status, gameId]);

  return elapsed;
}
