import { getAudio, playTone } from './engine.js';
import { noteToFrequency } from './notes.js';

const LINE_CLEAR_URL = `${import.meta.env.BASE_URL}sounds/line-clear.mp3`;
const LINE_CLEAR_VOLUME = 0.7;
// 지운 줄 수만큼 이 간격으로 이어서 울린다. 파일 하나가 1.5초 정도라 끝까지 기다리지 않고 겹쳐 붙인다.
const LINE_CLEAR_GAP = 0.12;

const CLEAR_ARPEGGIO = ['C6', 'E6', 'G6', 'C7'];
const TSPIN_ARPEGGIO = ['A5', 'C6', 'E6', 'A6'];
const LEVEL_UP_ARPEGGIO = ['C5', 'E5', 'G5', 'C6', 'E6'];
const GAME_OVER_NOTES = ['E5', 'C5', 'A4', 'E4'];

let lineClearBuffer = null;
let lineClearLoading = null;

// 처음 줄을 지울 때 늦지 않도록 게임을 시작할 때 미리 받아서 풀어 둔다. 실패하면 다음에 다시 시도한다.
export function preloadSounds() {
  const audio = getAudio();
  if (!audio || lineClearBuffer || lineClearLoading) return;
  lineClearLoading = fetch(LINE_CLEAR_URL)
    .then((response) => response.arrayBuffer())
    .then((data) => audio.context.decodeAudioData(data))
    .then((buffer) => {
      lineClearBuffer = buffer;
    })
    .catch(() => {})
    .finally(() => {
      lineClearLoading = null;
    });
}

function playBuffer(audio, buffer, { start, volume }) {
  const source = audio.context.createBufferSource();
  const gain = audio.context.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain).connect(audio.effects);
  source.start(start);
}

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
  // 줄을 지우면 지운 줄 수만큼 효과음 파일을 틀고, 아직 못 받았거나 줄 없는 T-스핀이면 합성음으로 대신한다.
  // 합성음은 지운 줄 수만큼 음이 올라가고, 콤보가 이어질수록 한 음씩 높아진다.
  clear: (audio, now, { cleared, tSpin, combo }) => {
    if (cleared > 0 && lineClearBuffer) {
      for (let i = 0; i < cleared; i += 1) {
        playBuffer(audio, lineClearBuffer, { start: now + i * LINE_CLEAR_GAP, volume: LINE_CLEAR_VOLUME });
      }
      return;
    }
    arpeggio(audio, (tSpin ? TSPIN_ARPEGGIO : CLEAR_ARPEGGIO).slice(0, Math.max(1, cleared)), {
      start: now,
      gap: cleared === 4 ? 0.07 : 0.05,
      duration: cleared === 4 ? 0.25 : 0.12,
      type: 'square',
      volume: 0.09,
      semitones: Math.min(12, Math.max(0, combo - 1)),
    });
  },
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
