import { describe, expect, it } from 'vitest';
import { STATUS } from '../game/constants.js';
import { ACTIONS, createInitialState, gameReducer } from '../game/game.js';
import { BASS, MELODY, getMusicTempo } from './korobeiniki.js';
import { noteToFrequency } from './notes.js';
import { getSoundEvents } from './soundEvents.js';

const totalBeats = (notes) => notes.reduce((sum, [, beats]) => sum + beats, 0);

describe('noteToFrequency', () => {
  it('A4는 440Hz, 한 옥타브 위는 두 배', () => {
    expect(noteToFrequency('A4')).toBeCloseTo(440);
    expect(noteToFrequency('A5')).toBeCloseTo(880);
    expect(noteToFrequency('C#5')).toBeCloseTo(554.37, 1);
  });
});

describe('코로베이니키', () => {
  it('선율과 베이스가 모두 8마디(32박)라 반복해도 박자가 맞는다', () => {
    expect(totalBeats(MELODY)).toBe(32);
    expect(totalBeats(BASS)).toBe(32);
  });

  it('레벨이 오르면 빨라지지만 상한을 넘지 않는다', () => {
    expect(getMusicTempo(1)).toBe(140);
    expect(getMusicTempo(2)).toBeGreaterThan(getMusicTempo(1));
    expect(getMusicTempo(50)).toBe(200);
  });
});

describe('getSoundEvents', () => {
  const started = gameReducer(createInitialState(1), { type: ACTIONS.START, seed: 1 });
  const types = (prev, next) => getSoundEvents(prev, next).map(({ type }) => type);

  it('이동·회전·홀드·하드 드롭에 맞는 효과음을 고른다', () => {
    expect(types(started, gameReducer(started, { type: ACTIONS.MOVE_LEFT }))).toEqual(['move']);
    expect(types(started, gameReducer(started, { type: ACTIONS.ROTATE }))).toEqual(['rotate']);
    expect(types(started, gameReducer(started, { type: ACTIONS.HOLD }))).toEqual(['hold']);
    expect(types(started, gameReducer(started, { type: ACTIONS.HARD_DROP }))).toEqual(['hardDrop']);
  });

  it('중력으로 한 칸 내려가거나 벽에 막혀 그대로면 소리를 내지 않는다', () => {
    expect(types(started, gameReducer(started, { type: ACTIONS.TICK }))).toEqual([]);
    expect(types(started, started)).toEqual([]);
  });

  it('새 판이 시작된 순간은 비교하지 않는다', () => {
    const restarted = gameReducer(started, { type: ACTIONS.START, seed: 2 });
    expect(types(started, restarted)).toEqual([]);
  });

  it('게임 오버가 되면 gameOver를 낸다', () => {
    expect(types(started, { ...started, status: STATUS.OVER })).toEqual(['gameOver']);
  });
});
