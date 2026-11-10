import { useCallback, useEffect, useRef, useState } from 'react';
import { getPieceCells } from '../game/pieces.js';
import { prefersReducedMotion } from '../motion.js';

// 소프트 드롭으로 한 칸 내려갈 때마다 내려가기 전 자리에 잔상을 남긴다.
// 잔상은 CSS 애니메이션으로 사라지고, 애니메이션이 끝나면 remove로 지운다.
export function useSoftDropTrail(current, softDropCount) {
  const [trail, setTrail] = useState([]);
  const previous = useRef({ current, softDropCount });

  useEffect(() => {
    const { current: from, softDropCount: lastCount } = previous.current;
    previous.current = { current, softDropCount };

    if (softDropCount === 0) {
      setTrail((items) => (items.length > 0 ? [] : items));
      return;
    }
    if (softDropCount === lastCount || !from || prefersReducedMotion()) return;

    const cells = getPieceCells(from).filter(({ y }) => y >= 0);
    setTrail((items) => [...items, { id: softDropCount, type: from.type, cells }]);
  }, [current, softDropCount]);

  const remove = useCallback((id) => {
    setTrail((items) => items.filter((item) => item.id !== id));
  }, []);

  return { trail, remove };
}
