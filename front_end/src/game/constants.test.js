import { describe, expect, it } from 'vitest';
import { getLineClearScore } from './constants.js';

describe('getLineClearScore', () => {
  it('지운 줄 수에 따라 점수를 계산한다', () => {
    expect(getLineClearScore(0)).toBe(0);
    expect(getLineClearScore(1)).toBe(200);
    expect(getLineClearScore(2)).toBe(1200);
    expect(getLineClearScore(3)).toBe(2400);
    expect(getLineClearScore(4)).toBe(4000);
  });
});
