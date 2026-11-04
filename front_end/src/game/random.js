// 시드 기반 난수(mulberry32). 리듀서를 순수 함수로 유지하고 테스트를 재현 가능하게 하기 위해
// Math.random 대신 상태에 시드를 저장하고 다음 시드를 함께 반환한다.
export function nextRandom(seed) {
  const nextSeed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(nextSeed ^ (nextSeed >>> 15), 1 | nextSeed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, seed: nextSeed };
}
