import { describe, expect, it } from 'vitest';
import { PIECES, PIECE_TYPES, createBag, rotateMatrix } from './pieces.js';

describe('rotateMatrix', () => {
  it('시계 방향으로 회전한다', () => {
    expect(rotateMatrix(PIECES.T.shape)).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ]);
  });

  it('네 번 회전하면 원래 모양으로 돌아온다', () => {
    PIECE_TYPES.forEach((type) => {
      const { shape } = PIECES[type];
      const rotated = [1, 2, 3, 4].reduce((matrix) => rotateMatrix(matrix), shape);
      expect(rotated).toEqual(shape);
    });
  });
});

describe('createBag', () => {
  it('7종 블록을 한 번씩 포함한다', () => {
    const { bag } = createBag(42);
    expect([...bag].sort()).toEqual([...PIECE_TYPES].sort());
  });

  it('같은 시드면 같은 순서를 만든다', () => {
    expect(createBag(123).bag).toEqual(createBag(123).bag);
  });
});
