export const COLS = 10;
export const ROWS = 20;

export const NEXT_PREVIEW_COUNT = 3;

export const PIECE_SCORE = 40;
export const LINE_SCORE = 200;

export const LINES_PER_LEVEL = 10;

export const STATUS = Object.freeze({
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  OVER: 'over',
});

export function getLevel(lines) {
  return Math.floor(lines / LINES_PER_LEVEL) + 1;
}

// 1줄은 200점, 여러 줄(x줄)은 (x * 200) * x점
export function getLineClearScore(lines) {
  if (lines <= 1) return lines * LINE_SCORE;
  return lines * LINE_SCORE * lines;
}

export function getDropInterval(level) {
  return Math.max(100, 1000 - (level - 1) * 75);
}
