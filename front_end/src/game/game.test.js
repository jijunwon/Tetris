import { describe, expect, it } from 'vitest';
import { COLS, ROWS, STATUS } from './constants.js';
import { ACTIONS, createInitialState, gameReducer } from './game.js';
import { createBoard } from './board.js';
import { createPiece, rotateMatrix } from './pieces.js';

function startedState(seed = 1) {
  return gameReducer(createInitialState(seed), { type: ACTIONS.START, seed });
}

function dispatchAll(state, types) {
  return types.reduce((current, type) => gameReducer(current, { type }), state);
}

describe('gameReducer', () => {
  it('START 후 블록이 생성되고 진행 상태가 된다', () => {
    const state = startedState();
    expect(state.status).toBe(STATUS.PLAYING);
    expect(state.current).not.toBeNull();
    expect(state.queue.length).toBeGreaterThanOrEqual(7);
  });

  it('RESET하면 진행 중이던 게임이 시작 전 상태로 돌아간다', () => {
    const playing = gameReducer(startedState(), { type: ACTIONS.HARD_DROP });
    const reset = gameReducer(playing, { type: ACTIONS.RESET, seed: 2 });

    expect(reset.status).toBe(STATUS.READY);
    expect(reset.current).toBeNull();
    expect(reset.score).toBe(0);
    expect(reset.board).toEqual(createBoard());
  });

  it('진행 중이 아니면 입력을 무시한다', () => {
    const ready = createInitialState(1);
    expect(gameReducer(ready, { type: ACTIONS.MOVE_LEFT })).toBe(ready);
  });

  it('왼쪽 벽을 넘어가지 않는다', () => {
    const state = { ...startedState(), current: createPiece('O') };
    const moved = dispatchAll(state, Array(COLS).fill(ACTIONS.MOVE_LEFT));
    expect(moved.current.x).toBe(0);
  });

  it('하드 드롭하면 바닥에 고정되고 다음 블록이 나온다', () => {
    const state = { ...startedState(), current: createPiece('O') };
    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.board[ROWS - 1].filter((cell) => cell === 'O')).toHaveLength(2);
    expect(next.score).toBe(40);
    expect(next.current.type).toBe(state.queue[0]);
  });

  it('소프트 드롭으로 내려가는 동안에는 점수가 오르지 않는다', () => {
    const state = startedState();
    expect(gameReducer(state, { type: ACTIONS.SOFT_DROP }).score).toBe(0);
  });

  it('줄을 채우면 지우고 점수와 줄 수가 오른다', () => {
    const board = createBoard();
    board[ROWS - 1] = [...Array(COLS - 4).fill('Z'), null, null, null, null];
    const state = {
      ...startedState(),
      board,
      current: { ...createPiece('I'), x: COLS - 4 },
    };

    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.lines).toBe(1);
    expect(next.board[ROWS - 1].every((cell) => cell === null)).toBe(true);
    expect(next.score).toBe(40 + 200);
  });

  it('4줄을 한 번에 지우면 (4 * 200) * 4점을 더한다', () => {
    const board = createBoard();
    for (let y = ROWS - 4; y < ROWS; y += 1) {
      board[y] = [...Array(COLS - 1).fill('Z'), null];
    }
    const vertical = { ...createPiece('I'), shape: rotateMatrix(createPiece('I').shape) };
    const state = { ...startedState(), board, current: { ...vertical, x: COLS - 3 } };

    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.lines).toBe(4);
    expect(next.score).toBe(40 + 4 * 200 * 4);
  });

  it('홀드는 블록이 고정되기 전까지 한 번만 쓸 수 있다', () => {
    const state = startedState();
    const held = gameReducer(state, { type: ACTIONS.HOLD });

    expect(held.hold).toBe(state.current.type);
    expect(held.canHold).toBe(false);
    expect(gameReducer(held, { type: ACTIONS.HOLD })).toBe(held);
  });

  it('새 블록이 생성 위치에서 충돌하면 게임 오버', () => {
    const board = createBoard().map((row, y) =>
      y >= 2 ? row.map((_, x) => (x < COLS - 1 ? 'Z' : null)) : row,
    );
    const state = { ...startedState(), board, current: createPiece('T') };

    const next = gameReducer(state, { type: ACTIONS.TICK });

    expect(next.status).toBe(STATUS.OVER);
  });

  it('일시정지 중에는 블록이 내려가지 않는다', () => {
    const paused = gameReducer(startedState(), { type: ACTIONS.TOGGLE_PAUSE });
    expect(paused.status).toBe(STATUS.PAUSED);
    expect(gameReducer(paused, { type: ACTIONS.TICK })).toBe(paused);
  });
});
