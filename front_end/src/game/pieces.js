import { COLS } from './constants.js';
import { nextRandom } from './random.js';

export const PIECES = {
  I: {
    color: '#22d3ee',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  O: {
    color: '#facc15',
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    color: '#a855f7',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  S: {
    color: '#22c55e',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  Z: {
    color: '#ef4444',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  J: {
    color: '#3b82f6',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  L: {
    color: '#f97316',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
};

export const PIECE_TYPES = Object.keys(PIECES);

export function createPiece(type) {
  const { shape } = PIECES[type];
  return {
    type,
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0,
  };
}

export function rotateMatrix(matrix) {
  const size = matrix.length;
  return matrix.map((row, y) => row.map((_, x) => matrix[size - 1 - x][y]));
}

export function getPieceCells(piece) {
  const cells = [];
  piece.shape.forEach((row, dy) => {
    row.forEach((filled, dx) => {
      if (filled) cells.push({ x: piece.x + dx, y: piece.y + dy });
    });
  });
  return cells;
}

// 7-bag: 7종을 한 번씩 섞어 내보내서 같은 블록이 너무 오래 안 나오는 일을 막는다.
export function createBag(seed) {
  const bag = [...PIECE_TYPES];
  let currentSeed = seed;
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const { value, seed: nextSeed } = nextRandom(currentSeed);
    currentSeed = nextSeed;
    const j = Math.floor(value * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return { bag, seed: currentSeed };
}
