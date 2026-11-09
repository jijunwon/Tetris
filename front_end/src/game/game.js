import { PIECE_SCORE, STATUS, getLevel, getLineClearScore } from './constants.js';
import { createBag, createPiece, getPieceCells, rotateMatrix } from './pieces.js';
import { clearLines, collides, createBoard, getDropPosition, mergePiece } from './board.js';

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
  };
}

function spawnPiece(state, type) {
  const current = createPiece(type);
  if (collides(state.board, current)) {
    return { ...state, current, status: STATUS.OVER };
  }
  return { ...state, current };
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
  return { ...state, current: moved };
}

function lockPiece(state, piece) {
  const { board, cleared } = clearLines(mergePiece(state.board, piece));
  const lines = state.lines + cleared;
  const locked = {
    ...state,
    board,
    current: null,
    lines,
    level: getLevel(lines),
    score: state.score + PIECE_SCORE + getLineClearScore(cleared),
  };

  if (getPieceCells(piece).some(({ y }) => y < 0)) {
    return { ...locked, status: STATUS.OVER };
  }
  return spawnNext(locked);
}

function moveDown(state) {
  return tryMove(state, 0, 1) ?? lockPiece(state, state.current);
}

function hardDrop(state) {
  return lockPiece(state, getDropPosition(state.board, state.current));
}

function rotate(state) {
  const { board, current } = state;
  const shape = rotateMatrix(current.shape);
  for (const dx of ROTATION_KICKS) {
    const candidate = { ...current, shape, x: current.x + dx };
    if (!collides(board, candidate)) return { ...state, current: candidate };
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
      return moveDown(state);
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
