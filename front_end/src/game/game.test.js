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

// 아래에서 rows줄이 오른쪽 끝 칸만 비어 있고, 그 위에 블록 하나를 남겨 All Clear가 되지 않게 한다.
function tetrisReadyBoard(rows) {
  const board = createBoard();
  for (let y = ROWS - rows; y < ROWS; y += 1) {
    board[y] = [...Array(COLS - 1).fill('Z'), null];
  }
  board[ROWS - rows - 1][0] = 'T';
  return board;
}

// 오른쪽 끝 열에 들어가는 세로 I 블록
function verticalI() {
  const piece = createPiece('I');
  return { ...piece, shape: rotateMatrix(piece.shape), x: COLS - 3 };
}

// 바닥 2줄에 T-스핀 더블 자리를 만든다 (가운데가 비어 있고 왼쪽 위가 막힌 홈).
function tSpinDoubleBoard() {
  const board = createBoard();
  board[ROWS - 1] = Array(COLS).fill('Z');
  board[ROWS - 1][4] = null;
  board[ROWS - 2] = Array(COLS).fill('Z');
  board[ROWS - 2][3] = null;
  board[ROWS - 2][4] = null;
  board[ROWS - 2][5] = null;
  board[ROWS - 3][3] = 'Z';
  return board;
}

// 오른쪽을 향한 T를 홈 위에 둔다. 한 번 더 회전하면 아래를 향해 홈에 들어간다.
function tPointingRight() {
  const piece = createPiece('T');
  return { ...piece, shape: rotateMatrix(piece.shape), x: 3, y: ROWS - 3 };
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

  it('소프트 드롭은 실제로 내려갔을 때만 횟수를 센다', () => {
    const dropped = gameReducer(startedState(), { type: ACTIONS.SOFT_DROP });
    const grounded = { ...dropped, current: { ...createPiece('O'), y: ROWS - 2 } };
    const locked = gameReducer(grounded, { type: ACTIONS.SOFT_DROP });

    expect(dropped.softDropCount).toBe(1);
    expect(locked.softDropCount).toBe(1);
    expect(locked.lockCount).toBe(1);
  });

  it('줄을 채우면 지우고 점수와 줄 수가 오른다', () => {
    const board = createBoard();
    board[ROWS - 2][0] = 'T';
    board[ROWS - 1] = [...Array(COLS - 4).fill('Z'), null, null, null, null];
    const state = {
      ...startedState(),
      board,
      current: { ...createPiece('I'), x: COLS - 4 },
    };

    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.lines).toBe(1);
    expect(next.board[ROWS - 1]).toEqual(['T', ...Array(COLS - 1).fill(null)]);
    expect(next.score).toBe(40 + 200);
    expect(next.lastClear).toMatchObject({ rows: [ROWS - 1], cleared: 1, points: 240 });
  });

  it('4줄을 한 번에 지우면 (4 * 200) * 4점을 더한다', () => {
    const board = tetrisReadyBoard(4);
    const state = { ...startedState(), board, current: verticalI() };

    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.lines).toBe(4);
    expect(next.score).toBe(40 + 4 * 200 * 4);
  });

  it('줄을 지우지 않고 고정하면 점수 문구 기록(lastClear)은 그대로다', () => {
    const state = { ...startedState(), current: createPiece('O') };
    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.lastClear).toBeNull();
    expect(next.lockCount).toBe(1);
    expect(next.hardDropCount).toBe(1);
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

describe('보너스 점수', () => {
  it('회전으로 홈에 끼워 넣으면 T-스핀 더블로 일반 점수의 2배를 받는다', () => {
    const state = { ...startedState(), board: tSpinDoubleBoard(), current: tPointingRight() };

    const next = dispatchAll(state, [ACTIONS.ROTATE, ACTIONS.HARD_DROP]);

    expect(next.lines).toBe(2);
    expect(next.score).toBe(40 + 800 * 2);
    expect(next.lastClear).toMatchObject({ tSpin: true, cleared: 2 });
    expect(next.backToBack).toBe(true);
  });

  it('마지막 동작이 회전이 아니면 T-스핀이 아니다', () => {
    const rotated = gameReducer(
      { ...startedState(), board: tSpinDoubleBoard(), current: tPointingRight() },
      { type: ACTIONS.ROTATE },
    );
    const state = { ...rotated, lastMoveRotation: false };

    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.lastClear.tSpin).toBe(false);
    expect(next.score).toBe(40 + 800);
  });

  it('테트리스를 연속으로 하면 두 번째는 Back-to-Back(1.5배)에 2콤보(2배)까지 받는다', () => {
    const first = gameReducer(
      { ...startedState(), board: tetrisReadyBoard(8), current: verticalI() },
      { type: ACTIONS.HARD_DROP },
    );
    const second = gameReducer({ ...first, current: verticalI() }, { type: ACTIONS.HARD_DROP });

    expect(first.lastClear).toMatchObject({ backToBack: false, combo: 1 });
    expect(second.lastClear).toMatchObject({ backToBack: true, combo: 2 });
    expect(second.score - first.score).toBe(40 + 3200 * 1.5 * 2);
  });

  it('3콤보는 줄 삭제 점수의 3배를 받는다', () => {
    const state = {
      ...startedState(),
      combo: 2,
      board: tetrisReadyBoard(1),
      current: verticalI(),
    };

    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.combo).toBe(3);
    expect(next.score).toBe(40 + 200 * 3);
  });

  it('줄을 지우지 못하고 고정하면 콤보가 끊긴다', () => {
    const cleared = gameReducer(
      { ...startedState(), board: tetrisReadyBoard(4), current: verticalI() },
      { type: ACTIONS.HARD_DROP },
    );
    const next = gameReducer(
      { ...cleared, current: createPiece('O') },
      { type: ACTIONS.HARD_DROP },
    );

    expect(cleared.combo).toBe(1);
    expect(next.combo).toBe(0);
    expect(next.backToBack).toBe(true);
  });

  it('보드를 전부 비우면 All Clear 보너스를 받는다', () => {
    const board = createBoard();
    board[ROWS - 1] = [...Array(COLS - 4).fill('Z'), null, null, null, null];
    const state = { ...startedState(), board, current: { ...createPiece('I'), x: COLS - 4 } };

    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.lastClear.allClear).toBe(true);
    expect(next.score).toBe(40 + 200 + 3000);
  });

  it('레벨이 오르면 lastClear에 새 레벨을 남긴다', () => {
    const state = {
      ...startedState(),
      lines: 9,
      board: tetrisReadyBoard(1),
      current: verticalI(),
    };

    const next = gameReducer(state, { type: ACTIONS.HARD_DROP });

    expect(next.level).toBe(2);
    expect(next.lastClear.levelUp).toBe(2);
  });
});
