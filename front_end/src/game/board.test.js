import { describe, expect, it } from 'vitest';
import { COLS, ROWS } from './constants.js';
import {
  addGarbageRow,
  clearLines,
  collides,
  createBoard,
  getDropPosition,
  mergePiece,
} from './board.js';
import { GARBAGE, createPiece } from './pieces.js';

describe('collides', () => {
  it('벽과 바닥을 벗어나면 충돌한다', () => {
    const board = createBoard();
    const piece = createPiece('O');
    expect(collides(board, { ...piece, x: -1 })).toBe(true);
    expect(collides(board, { ...piece, x: COLS - 1 })).toBe(true);
    expect(collides(board, { ...piece, y: ROWS - 1 })).toBe(true);
    expect(collides(board, piece)).toBe(false);
  });

  it('쌓인 블록과 겹치면 충돌한다', () => {
    const board = createBoard();
    const piece = createPiece('O');
    board[1][piece.x] = 'Z';
    expect(collides(board, piece)).toBe(true);
  });

  it('보드 위쪽(y < 0)은 충돌로 보지 않는다', () => {
    expect(collides(createBoard(), { ...createPiece('O'), y: -1 })).toBe(false);
  });
});

describe('mergePiece', () => {
  it('원본 보드를 바꾸지 않고 새 보드를 반환한다', () => {
    const board = createBoard();
    const merged = mergePiece(board, createPiece('O'));
    expect(board.flat().every((cell) => cell === null)).toBe(true);
    expect(merged.flat().filter((cell) => cell === 'O')).toHaveLength(4);
  });
});

describe('clearLines', () => {
  it('꽉 찬 줄을 지우고 위에 빈 줄을 채운다', () => {
    const board = createBoard();
    board[ROWS - 1] = Array(COLS).fill('I');
    board[ROWS - 2] = Array(COLS).fill('I');
    board[ROWS - 3][0] = 'T';

    const result = clearLines(board);

    expect(result.cleared).toBe(2);
    expect(result.rows).toEqual([ROWS - 2, ROWS - 1]);
    expect(result.board).toHaveLength(ROWS);
    expect(result.board[ROWS - 1][0]).toBe('T');
    expect(result.board[0].every((cell) => cell === null)).toBe(true);
  });
});

describe('addGarbageRow', () => {
  it('빈칸이 하나인 회색 줄을 맨 아래에 넣고 나머지를 한 줄 올린다', () => {
    const board = createBoard();
    board[ROWS - 1][0] = 'T';

    const raised = addGarbageRow(board, 3);

    expect(raised).toHaveLength(ROWS);
    expect(raised[ROWS - 2][0]).toBe('T');
    expect(raised[ROWS - 1][3]).toBeNull();
    expect(raised[ROWS - 1].filter((cell) => cell === GARBAGE)).toHaveLength(COLS - 1);
  });
});

describe('getDropPosition', () => {
  it('바닥까지 떨어진 위치를 반환한다', () => {
    const dropped = getDropPosition(createBoard(), createPiece('O'));
    expect(dropped.y).toBe(ROWS - 2);
  });
});
