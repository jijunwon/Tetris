import { COLS, PIECE_SCORE, ROWS, getLineClearScore } from './constants.js';

export const TSPIN_SCORE = 200;
export const TSPIN_MULTIPLIER = 2;
export const BACK_TO_BACK_MULTIPLIER = 1.5;
export const COMBO_SCORE = 100;
export const ALL_CLEAR_SCORE = 3000;

// T 블록의 3×3 상자 네 모서리 중 3칸 이상이 벽·바닥·블록으로 막혀 있고,
// 마지막 동작이 회전이었으면 T-스핀으로 본다.
export function isTSpin(board, piece, lastMoveRotation) {
  if (piece.type !== 'T' || !lastMoveRotation) return false;

  const corners = [
    [piece.x, piece.y],
    [piece.x + 2, piece.y],
    [piece.x, piece.y + 2],
    [piece.x + 2, piece.y + 2],
  ];
  const blocked = corners.filter(([x, y]) => {
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    return y >= 0 && board[y][x] !== null;
  });
  return blocked.length >= 3;
}

// T-스핀 없이 0줄: 0점, T-스핀 0줄: 200점, T-스핀으로 지운 줄은 일반 점수의 2배
export function getClearScore(cleared, tSpin) {
  if (!tSpin) return getLineClearScore(cleared);
  if (cleared === 0) return TSPIN_SCORE;
  return getLineClearScore(cleared) * TSPIN_MULTIPLIER;
}

// 테트리스(4줄)와 줄을 지운 T-스핀은 "어려운 삭제"라서 연속으로 하면 Back-to-Back 보너스를 받는다.
export function isDifficultClear(cleared, tSpin) {
  return cleared === 4 || (tSpin && cleared > 0);
}

// combo: 줄을 연속으로 지운 횟수 - 1 (첫 삭제는 0, 끊기면 -1)
export function scoreLock({ cleared, tSpin, backToBack, combo, allClear }) {
  let clearScore = getClearScore(cleared, tSpin);
  if (backToBack) clearScore = Math.floor(clearScore * BACK_TO_BACK_MULTIPLIER);

  const comboScore = combo > 0 ? combo * COMBO_SCORE : 0;
  const allClearScore = allClear ? ALL_CLEAR_SCORE : 0;
  return PIECE_SCORE + clearScore + comboScore + allClearScore;
}
