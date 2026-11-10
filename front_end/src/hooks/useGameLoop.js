import { useEffect, useRef } from 'react';

export function useGameLoop(onTick, interval, active) {
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!active) return undefined;

    let frameId;
    let last = null;
    let elapsed = 0;

    // rAF 타임스탬프와 performance.now()는 어긋날 수 있어서(개발자 도구의 애니메이션 속도 조절 등)
    // 시간 차는 rAF 타임스탬프끼리만 재고, 음수가 되면 버린다.
    const loop = (now) => {
      if (last !== null) elapsed += Math.max(0, now - last);
      last = now;
      if (elapsed >= interval) {
        elapsed = 0;
        onTickRef.current();
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [interval, active]);
}
