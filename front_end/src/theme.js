export const THEMES = [
  { id: 'light', label: '라이트' },
  { id: 'dark', label: '다크' },
  { id: 'neon', label: '네온' },
];

const DEFAULT_THEME = 'dark';
const STORAGE_KEY = 'tetris-theme';

export function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES.some(({ id }) => id === saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // 저장소를 쓸 수 없는 환경이면 이번 방문 동안만 유지된다.
  }
}
