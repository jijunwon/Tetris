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
    // 여러 줄을 지울 때 효과음이 겹쳐도 소리가 찢어지지 않도록 마지막에 압축기를 둔다.
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.ratio.value = 6;
    compressor.connect(context.destination);

    const master = context.createGain();
    master.gain.value = MASTER_GAIN * masterVolume;
    master.connect(compressor);

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

let noiseBuffer = null;

// 짧은 잡음을 필터로 깎아서 '탁', '팡' 같은 타격음을 만든다.
export function playNoise(
  { context },
  bus,
  { start, duration, volume = 0.3, filter = 'highpass', frequency = 2000 },
) {
  if (!noiseBuffer) {
    noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.5), context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const biquad = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = noiseBuffer;
  biquad.type = filter;
  biquad.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.connect(biquad).connect(gain).connect(bus);
  source.start(start);
  source.stop(start + duration + 0.02);
}
