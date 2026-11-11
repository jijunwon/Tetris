import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'tetris-sound';
const DEFAULT_SETTINGS = { music: true, effects: true, volume: 0.8, muted: false };

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSoundSettings() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // 저장소를 쓸 수 없는 환경이면 이번 방문 동안만 유지된다.
    }
  }, [settings]);

  const toggle = useCallback((key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  // 음소거 중에 볼륨을 움직이면 음소거도 풀린다.
  const setVolume = useCallback((volume) => {
    setSettings((current) => ({ ...current, volume, muted: false }));
  }, []);

  return [settings, toggle, setVolume];
}
