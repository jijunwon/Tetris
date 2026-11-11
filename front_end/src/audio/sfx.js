import { getAudio, playNoise, playTone } from './engine.js';
import { noteToFrequency } from './notes.js';

const LINE_CLEAR_URL = `${import.meta.env.BASE_URL}sounds/line-clear.mp3`;
const LINE_CLEAR_VOLUME = 0.6;
// 지운 줄 수만큼 효과음을 거의 동시에 겹쳐서 한 번의 두꺼운 '팡!'으로 만든다.
// 같은 음이 겹치면 뭉개지므로 줄마다 재생 속도(음높이)를 조금씩 다르게 한다.
const LINE_CLEAR_GAP = 0.03;
const LINE_CLEAR_RATES = [1, 0.94, 1.07, 0.89];

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

function playBuffer(audio, buffer, { start, volume, rate = 1 }) {
  const source = audio.context.createBufferSource();
  const gain = audio.context.createGain();
  source.buffer = buffer;
  source.playbackRate.value = rate;
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
  // 높은 '틱' + 빠르게 떨어지는 '슉' + 가벼운 바닥 소리로 경쾌하게
  hardDrop: (audio, now) => {
    playNoise(audio, audio.effects, { start: now, duration: 0.035, volume: 0.35, frequency: 3000 });
    playTone(audio, audio.effects, {
      frequency: 1400,
      slideTo: 420,
      start: now,
      duration: 0.06,
      type: 'square',
      volume: 0.07,
    });
    playTone(audio, audio.effects, {
      frequency: 180,
      slideTo: 110,
      start: now + 0.01,
      duration: 0.06,
      type: 'triangle',
      volume: 0.18,
    });
  },
  // 줄을 지우면 짧은 타격음 위에 효과음 파일을 지운 줄 수만큼 겹쳐 '팡!' 하고 터뜨린다.
  // 파일을 아직 못 받았거나 줄 없는 T-스핀이면 합성음으로 대신한다.
  // 합성음은 지운 줄 수만큼 음이 올라가고, 콤보가 이어질수록 한 음씩 높아진다.
  clear: (audio, now, { cleared, tSpin, combo }) => {
    if (cleared > 0 && lineClearBuffer) {
      playNoise(audio, audio.effects, {
        start: now,
        duration: 0.08 + cleared * 0.03,
        volume: 0.2 + cleared * 0.06,
        frequency: 1200,
      });
      playTone(audio, audio.effects, {
        frequency: 200,
        slideTo: 70,
        start: now,
        duration: 0.12,
        type: 'triangle',
        volume: 0.15 + cleared * 0.05,
      });
      for (let i = 0; i < cleared; i += 1) {
        playBuffer(audio, lineClearBuffer, {
          start: now + i * LINE_CLEAR_GAP,
          volume: LINE_CLEAR_VOLUME,
          rate: LINE_CLEAR_RATES[i % LINE_CLEAR_RATES.length],
        });
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
