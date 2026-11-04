import { COLS, ROWS } from './constants.js';
import { getPieceCells } from './pieces.js';

// 각 칸은 비어 있으면 null, 채워져 있으면 블록 종류('I', 'T' 등)를 담는다.
export function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// 보드 위쪽(y < 0)은 회전·생성 직후를 위해 허용하고, 벽·바닥·쌓인 블록만 충돌로 본다.
export function collides(board, piece) {
  return getPieceCells(piece).some(({ x, y }) => {
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    return y >= 0 && board[y][x] !== null;
  });
}

export function mergePiece(board, piece) {
  const next = board.map((row) => [...row]);
  getPieceCells(piece).forEach(({ x, y }) => {
    if (y >= 0) next[y][x] = piece.type;
  });
  return next;
}

export function clearLines(board) {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - remaining.length;
  const emptyRows = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { board: [...emptyRows, ...remaining], cleared };
}

export function getDropPosition(board, piece) {
  let dropped = piece;
  while (!collides(board, { ...dropped, y: dropped.y + 1 })) {
    dropped = { ...dropped, y: dropped.y + 1 };
  }
  return dropped;
}
