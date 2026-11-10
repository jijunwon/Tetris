import { useEffect, useRef } from 'react';
import { isDifficultClear } from '../game/scoring.js';
import { prefersReducedMotion } from '../motion.js';

const DROP_BUMP = [
  { transform: 'translateY(0)' },
  { transform: 'translateY(5px)' },
  { transform: 'translateY(0)' },
];

const BIG_SHAKE = [
  { transform: 'translate(0, 0)' },
  { transform: 'translate(-7px, 2px)' },
  { transform: 'translate(6px, -2px)' },
  { transform: 'translate(-4px, 1px)' },
  { transform: 'translate(2px, 0)' },
  { transform: 'translate(0, 0)' },
];

// 하드 드롭하면 살짝 튕기고, 테트리스·T-스핀·All Clear면 크게 흔든다.
export function useBoardShake(hardDropCount, lastClear) {
  const ref = useRef(null);

  useEffect(() => {
    if (hardDropCount === 0 || prefersReducedMotion()) return;
    ref.current?.animate(DROP_BUMP, { duration: 120, easing: 'ease-out' });
  }, [hardDropCount]);

  useEffect(() => {
    if (!lastClear || prefersReducedMotion()) return;
    if (!isDifficultClear(lastClear.cleared, lastClear.tSpin) && !lastClear.allClear) return;
    ref.current?.animate(BIG_SHAKE, { duration: 320, easing: 'ease-out' });
  }, [lastClear]);

  return ref;
}
