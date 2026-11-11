const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// 'E5', 'G#4' 같은 음 이름을 주파수(Hz)로 바꾼다. A4 = 440Hz 기준 평균율.
export function noteToFrequency(note) {
  const match = /^([A-G])(#?)(-?\d)$/.exec(note);
  if (!match) throw new Error(`알 수 없는 음 이름: ${note}`);
  const [, letter, sharp, octave] = match;
  const midi = 12 * (Number(octave) + 1) + SEMITONES[letter] + (sharp ? 1 : 0);
  return 440 * 2 ** ((midi - 69) / 12);
}
