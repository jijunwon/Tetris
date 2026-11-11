import { getAudio, playTone } from './engine.js';
import { BASE_TEMPO, BASS, MELODY } from './korobeiniki.js';
import { noteToFrequency } from './notes.js';

const STEP_BEATS = 0.5;
const LOOKAHEAD_SECONDS = 0.1;
const SCHEDULE_INTERVAL_MS = 25;

const TRACKS = [
  { notes: MELODY, type: 'square', volume: 0.16, length: 0.9 },
  { notes: BASS, type: 'triangle', volume: 0.3, length: 0.8 },
];

// 두 트랙을 8분음표 칸으로 펼쳐서, 칸마다 그 칸에서 시작하는 음 목록을 만든다.
function buildSteps() {
  const totalBeats = MELODY.reduce((sum, [, beats]) => sum + beats, 0);
  const steps = Array.from({ length: totalBeats / STEP_BEATS }, () => []);
  TRACKS.forEach((track) => {
    let beat = 0;
    track.notes.forEach(([note, beats]) => {
      if (note) steps[beat / STEP_BEATS].push({ ...track, frequency: noteToFrequency(note), beats });
      beat += beats;
    });
  });
  return steps;
}

const STEPS = buildSteps();

// 박자를 오디오 시계 기준으로 조금 앞서 예약해서, 화면이 바빠도 리듬이 흔들리지 않게 한다.
export function createMusicPlayer() {
  let timer = null;
  let stepIndex = 0;
  let nextTime = 0;
  let tempo = BASE_TEMPO;
  const playing = new Set();

  const schedule = () => {
    const audio = getAudio();
    if (!audio) return;
    while (nextTime < audio.context.currentTime + LOOKAHEAD_SECONDS) {
      const secondsPerBeat = 60 / tempo;
      STEPS[stepIndex].forEach(({ frequency, beats, type, volume, length }) => {
        const oscillator = playTone(audio, audio.music, {
          frequency,
          start: nextTime,
          duration: beats * secondsPerBeat * length,
          type,
          volume,
        });
        playing.add(oscillator);
        oscillator.onended = () => playing.delete(oscillator);
      });
      nextTime += STEP_BEATS * secondsPerBeat;
      stepIndex = (stepIndex + 1) % STEPS.length;
    }
  };

  return {
    play() {
      if (timer) return;
      const audio = getAudio();
      if (!audio) return;
      nextTime = audio.context.currentTime + 0.05;
      schedule();
      timer = setInterval(schedule, SCHEDULE_INTERVAL_MS);
    },
    pause() {
      clearInterval(timer);
      timer = null;
      playing.forEach((oscillator) => oscillator.stop());
      playing.clear();
    },
    restart() {
      stepIndex = 0;
    },
    setTempo(bpm) {
      tempo = bpm;
    },
  };
}
