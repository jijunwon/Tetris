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

// rows: 지운 줄의 번호(지우기 전 보드 기준). 줄 삭제 연출에 쓴다.
export function clearLines(board) {
  const rows = [];
  const remaining = board.filter((row, y) => {
    const full = row.every((cell) => cell !== null);
    if (full) rows.push(y);
    return !full;
  });
  const cleared = rows.length;
  const emptyRows = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { board: [...emptyRows, ...remaining], cleared, rows };
}

export function isBoardEmpty(board) {
  return board.every((row) => row.every((cell) => cell === null));
}

export function getDropPosition(board, piece) {
  let dropped = piece;
  while (!collides(board, { ...dropped, y: dropped.y + 1 })) {
    dropped = { ...dropped, y: dropped.y + 1 };
  }
  return dropped;
}
