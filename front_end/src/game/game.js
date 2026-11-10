import { COLS, STATUS, getLevel } from './constants.js';
import { createBag, createPiece, getPieceCells, rotateMatrix } from './pieces.js';
import { nextRandom } from './random.js';
import {
  addGarbageRow,
  clearLines,
  collides,
  createBoard,
  getDropPosition,
  isBoardEmpty,
  mergePiece,
} from './board.js';
import { isDifficultClear, isTSpin, scoreLock } from './scoring.js';

export const ACTIONS = Object.freeze({
  START: 'START',
  RESET: 'RESET',
  TICK: 'TICK',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  ROTATE: 'ROTATE',
  SOFT_DROP: 'SOFT_DROP',
  HARD_DROP: 'HARD_DROP',
  HOLD: 'HOLD',
  TOGGLE_PAUSE: 'TOGGLE_PAUSE',
});

const MIN_QUEUE_LENGTH = 7;

// 회전 후 벽이나 블록에 걸리면 좌우로 밀어서 다시 시도한다(간단한 wall kick).
const ROTATION_KICKS = [0, -1, 1, -2, 2];

function refillQueue(queue, seed) {
  let nextQueue = queue;
  let nextSeed = seed;
  while (nextQueue.length < MIN_QUEUE_LENGTH) {
    const { bag, seed: bagSeed } = createBag(nextSeed);
    nextQueue = [...nextQueue, ...bag];
    nextSeed = bagSeed;
  }
  return { queue: nextQueue, seed: nextSeed };
}

export function createInitialState(seed) {
  const { queue, seed: nextSeed } = refillQueue([], seed);
  return {
    // 판마다 달라지고 게임 중에는 바뀌지 않는다. 타이머가 새 판을 알아보는 데 쓴다.
    gameId: seed,
    status: STATUS.READY,
    board: createBoard(),
    current: null,
    queue,
    seed: nextSeed,
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    combo: 0,
    backToBack: false,
    lastMoveRotation: false,
    lockCount: 0,
    hardDropCount: 0,
    softDropCount: 0,
    // 줄을 지우거나 T-스핀을 했을 때만 바뀐다. 화면 연출(문구, 줄 삭제 효과)에 쓴다.
    lastClear: null,
  };
}

function spawnPiece(state, type) {
  const current = createPiece(type);
  // 나올 자리가 막혔으면 새 블록을 쌓인 블록 위에 겹쳐 그리지 않도록 비워 둔다.
  if (collides(state.board, current)) {
    return { ...state, current: null, lastMoveRotation: false, status: STATUS.OVER };
  }
  return { ...state, current, lastMoveRotation: false };
}

function spawnNext(state) {
  const [type, ...rest] = state.queue;
  const { queue, seed } = refillQueue(rest, state.seed);
  return spawnPiece({ ...state, queue, seed, canHold: true }, type);
}

function startGame(seed) {
  return spawnNext({ ...createInitialState(seed), status: STATUS.PLAYING });
}

function tryMove(state, dx, dy) {
  const moved = { ...state.current, x: state.current.x + dx, y: state.current.y + dy };
  if (collides(state.board, moved)) return null;
  return { ...state, current: moved, lastMoveRotation: false };
}

function lockPiece(state, piece) {
  const tSpin = isTSpin(state.board, piece, state.lastMoveRotation);
  const { board, cleared, rows } = clearLines(mergePiece(state.board, piece));
  const difficult = isDifficultClear(cleared, tSpin);
  const backToBack = difficult && state.backToBack;
  const combo = cleared > 0 ? state.combo + 1 : 0;
  const allClear = cleared > 0 && isBoardEmpty(board);
  const points = scoreLock({ cleared, tSpin, backToBack, combo, allClear });

  const lines = state.lines + cleared;
  const level = getLevel(lines);
  const lockCount = state.lockCount + 1;
  const showClear = cleared > 0 || tSpin;

  const locked = {
    ...state,
    board,
    current: null,
    lines,
    level,
    score: state.score + points,
    combo,
    // 줄을 지우지 않은 고정은 Back-to-Back 연속을 끊지 않는다.
    backToBack: cleared > 0 ? difficult : state.backToBack,
    lockCount,
    lastClear: showClear
      ? {
          id: lockCount,
          rows,
          cleared,
          tSpin,
          backToBack,
          combo,
          allClear,
          points,
          levelUp: level > state.level ? level : null,
        }
      : state.lastClear,
  };

  if (getPieceCells(piece).some(({ y }) => y < 0)) {
    return { ...locked, status: STATUS.OVER };
  }

  return spawnNext(raiseGarbage(locked, level - state.level));
}

// 오른 레벨 수만큼 빈칸 위치가 랜덤인 방해 줄을 밑에서 올린다.
// 레벨은 줄을 지운 직후에만 오르고 그때 맨 윗줄은 항상 비어 있어서, 밀려나 사라지는 블록은 없다.
function raiseGarbage(state, count) {
  let { board, seed } = state;
  for (let i = 0; i < count; i += 1) {
    const { value, seed: nextSeed } = nextRandom(seed);
    seed = nextSeed;
    board = addGarbageRow(board, Math.floor(value * COLS));
  }
  return { ...state, board, seed };
}

function moveDown(state) {
  return tryMove(state, 0, 1) ?? lockPiece(state, state.current);
}

// 소프트 드롭으로 실제로 내려간 횟수를 세어 화면이 잔상을 남길 수 있게 한다.
function softDrop(state) {
  const moved = tryMove(state, 0, 1);
  if (!moved) return lockPiece(state, state.current);
  return { ...moved, softDropCount: state.softDropCount + 1 };
}

function hardDrop(state) {
  const dropped = getDropPosition(state.board, state.current);
  const moved = dropped.y !== state.current.y;
  return lockPiece(
    {
      ...state,
      hardDropCount: state.hardDropCount + 1,
      lastMoveRotation: moved ? false : state.lastMoveRotation,
    },
    dropped,
  );
}

function rotate(state) {
  const { board, current } = state;
  const shape = rotateMatrix(current.shape);
  for (const dx of ROTATION_KICKS) {
    const candidate = { ...current, shape, x: current.x + dx };
    if (!collides(board, candidate)) {
      return { ...state, current: candidate, lastMoveRotation: true };
    }
  }
  return state;
}

function holdPiece(state) {
  if (!state.canHold) return state;
  const withHold = { ...state, hold: state.current.type };
  const next = state.hold === null ? spawnNext(withHold) : spawnPiece(withHold, state.hold);
  return { ...next, canHold: false };
}

function togglePause(state) {
  if (state.status === STATUS.PLAYING) return { ...state, status: STATUS.PAUSED };
  if (state.status === STATUS.PAUSED) return { ...state, status: STATUS.PLAYING };
  return state;
}

export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START:
      return startGame(action.seed);
    case ACTIONS.RESET:
      return createInitialState(action.seed);
    case ACTIONS.TOGGLE_PAUSE:
      return togglePause(state);
    default:
      break;
  }

  if (state.status !== STATUS.PLAYING) return state;

  switch (action.type) {
    case ACTIONS.TICK:
      return moveDown(state);
    case ACTIONS.MOVE_LEFT:
      return tryMove(state, -1, 0) ?? state;
    case ACTIONS.MOVE_RIGHT:
      return tryMove(state, 1, 0) ?? state;
    case ACTIONS.SOFT_DROP:
      return softDrop(state);
    case ACTIONS.HARD_DROP:
      return hardDrop(state);
    case ACTIONS.ROTATE:
      return rotate(state);
    case ACTIONS.HOLD:
      return holdPiece(state);
    default:
      return state;
  }
}
