import { useEffect, useRef } from 'react';

export function useGameLoop(onTick, interval, active) {
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!active) return undefined;

    let frameId;
    let last = performance.now();
    let elapsed = 0;

    const loop = (now) => {
      elapsed += now - last;
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
