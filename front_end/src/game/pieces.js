import { COLS } from './constants.js';
import { nextRandom } from './random.js';

export const PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
};

export const PIECE_TYPES = Object.keys(PIECES);

// 레벨이 오를 때 밑에서 올라오는 방해 줄의 칸. 7-bag에 들어가지 않도록 PIECES와 따로 둔다.
export const GARBAGE = 'G';

// 블록 색은 테마마다 달라서 index.css의 --piece-I, --piece-G 같은 변수로 정의한다.
export function getCellColor(type) {
  return `var(--piece-${type})`;
}

// 블록의 맨 아랫줄만 보드 첫 줄(y = 0)에 걸치고 나머지는 보드 위에서 생겨서,
// 내려오면서 아랫줄부터 차례로 보이게 한다.
export function createPiece(type) {
  const { shape } = PIECES[type];
  const bottomRow = shape.findLastIndex((row) => row.some(Boolean));
  return {
    type,
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: -bottomRow,
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
