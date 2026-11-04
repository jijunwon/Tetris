import { describe, expect, it } from 'vitest';
import { addRankingEntry, loadRanking, saveRanking } from './ranking.js';

function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, value),
  };
}

describe('addRankingEntry', () => {
  it('점수 내림차순으로 정렬한다', () => {
    const ranking = [{ id: 1, score: 500 }, { id: 2, score: 100 }];
    const next = addRankingEntry(ranking, { id: 3, score: 300 });
    expect(next.map((entry) => entry.id)).toEqual([1, 3, 2]);
  });

  it('최대 개수를 넘으면 낮은 점수를 잘라낸다', () => {
    const ranking = [{ id: 1, score: 500 }, { id: 2, score: 100 }];
    const next = addRankingEntry(ranking, { id: 3, score: 300 }, 2);
    expect(next.map((entry) => entry.id)).toEqual([1, 3]);
  });

  it('같은 점수면 먼저 기록된 항목이 위에 온다', () => {
    const next = addRankingEntry([{ id: 1, score: 200 }], { id: 2, score: 200 });
    expect(next.map((entry) => entry.id)).toEqual([1, 2]);
  });
});

describe('loadRanking / saveRanking', () => {
  it('저장한 랭킹을 다시 불러온다', () => {
    const storage = createStorage();
    const ranking = [{ id: 1, score: 500 }];
    saveRanking(ranking, storage);
    expect(loadRanking(storage)).toEqual(ranking);
  });

  it('저장된 값이 없거나 깨져 있으면 빈 배열을 돌려준다', () => {
    const storage = createStorage();
    expect(loadRanking(storage)).toEqual([]);
    storage.setItem('tetris.ranking', '{broken');
    expect(loadRanking(storage)).toEqual([]);
  });
});
