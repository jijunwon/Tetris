let audio = null;
// 소리를 처음 낼 때 오디오를 만들기 때문에, 그 전에 바꾼 볼륨도 기억해 뒀다가 적용한다.
let masterVolume = 1;
const MASTER_GAIN = 0.6;

export function setMasterVolume(value) {
  masterVolume = value;
  if (!audio) return;
  audio.master.gain.setTargetAtTime(MASTER_GAIN * value, audio.context.currentTime, 0.01);
}

// 브라우저는 사용자가 페이지를 누르거나 키를 치기 전에는 소리를 막는다.
// 그래서 게임을 시작할 때처럼 처음 소리가 필요한 순간에 만들고, 멈춰 있으면 깨운다.
export function getAudio() {
  if (!audio) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;

    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = MASTER_GAIN * masterVolume;
    master.connect(context.destination);

    const music = context.createGain();
    music.gain.value = 0.35;
    music.connect(master);

    const effects = context.createGain();
    effects.gain.value = 0.7;
    effects.connect(master);

    audio = { context, master, music, effects };
  }
  if (audio.context.state === 'suspended') audio.context.resume();
  return audio;
}

// 짧은 음 하나를 예약한다. slideTo를 주면 그 주파수까지 미끄러진다.
export function playTone(
  { context },
  bus,
  { frequency, start, duration, type = 'square', volume = 0.2, slideTo },
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain).connect(bus);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
  return oscillator;
}
