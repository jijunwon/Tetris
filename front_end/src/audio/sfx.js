import { getAudio, playTone } from './engine.js';
import { noteToFrequency } from './notes.js';

const CLEAR_ARPEGGIO = ['C6', 'E6', 'G6', 'C7'];
const TSPIN_ARPEGGIO = ['A5', 'C6', 'E6', 'A6'];
const LEVEL_UP_ARPEGGIO = ['C5', 'E5', 'G5', 'C6', 'E6'];
const GAME_OVER_NOTES = ['E5', 'C5', 'A4', 'E4'];

// 음 이름 목록을 간격을 두고 차례로 울린다. semitones만큼 음을 올린다.
function arpeggio(audio, notes, { start, gap, duration, type, volume, semitones = 0 }) {
  notes.forEach((note, i) => {
    playTone(audio, audio.effects, {
      frequency: noteToFrequency(note) * 2 ** (semitones / 12),
      start: start + i * gap,
      duration,
      type,
      volume,
    });
  });
}

const SOUNDS = {
  move: (audio, now) =>
    playTone(audio, audio.effects, { frequency: 660, start: now, duration: 0.03, type: 'triangle', volume: 0.12 }),
  rotate: (audio, now) =>
    playTone(audio, audio.effects, {
      frequency: 880,
      slideTo: 1320,
      start: now,
      duration: 0.05,
      type: 'square',
      volume: 0.06,
    }),
  hold: (audio, now) =>
    playTone(audio, audio.effects, {
      frequency: 520,
      slideTo: 780,
      start: now,
      duration: 0.09,
      type: 'triangle',
      volume: 0.2,
    }),
  lock: (audio, now) =>
    playTone(audio, audio.effects, { frequency: 150, start: now, duration: 0.07, type: 'triangle', volume: 0.3 }),
  hardDrop: (audio, now) =>
    playTone(audio, audio.effects, {
      frequency: 220,
      slideTo: 55,
      start: now,
      duration: 0.15,
      type: 'triangle',
      volume: 0.5,
    }),
  // 지운 줄 수만큼 음이 올라가고, 콤보가 이어질수록 한 음씩 높아진다.
  clear: (audio, now, { cleared, tSpin, combo }) =>
    arpeggio(audio, (tSpin ? TSPIN_ARPEGGIO : CLEAR_ARPEGGIO).slice(0, Math.max(1, cleared)), {
      start: now,
      gap: cleared === 4 ? 0.07 : 0.05,
      duration: cleared === 4 ? 0.25 : 0.12,
      type: 'square',
      volume: 0.09,
      semitones: Math.min(12, Math.max(0, combo - 1)),
    }),
  levelUp: (audio, now) =>
    arpeggio(audio, LEVEL_UP_ARPEGGIO, {
      start: now + 0.25,
      gap: 0.06,
      duration: 0.14,
      type: 'triangle',
      volume: 0.25,
    }),
  gameOver: (audio, now) =>
    arpeggio(audio, GAME_OVER_NOTES, {
      start: now + 0.1,
      gap: 0.18,
      duration: 0.3,
      type: 'square',
      volume: 0.1,
    }),
};

export function playSound(event) {
  const audio = getAudio();
  if (!audio) return;
  SOUNDS[event.type]?.(audio, audio.context.currentTime, event);
}
