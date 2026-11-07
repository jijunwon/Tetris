export const RANKING_SIZE = 5;
export const NICKNAME_MAX_LENGTH = 8;

const STORAGE_KEY = 'tetris.ranking';

export function addRankingEntry(ranking, entry, size = RANKING_SIZE) {
  return [...ranking, entry].sort((a, b) => b.score - a.score).slice(0, size);
}

export function loadRanking(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRanking(ranking, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(ranking));
  } catch {
    // 저장소를 쓸 수 없는 환경(시크릿 모드 등)에서는 기록을 남기지 않는다
  }
}
