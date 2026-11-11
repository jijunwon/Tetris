import { useEffect, useRef, useState } from 'react';
import { THEMES } from '../theme.js';

const SOUND_OPTIONS = [
  { key: 'music', label: '음악' },
  { key: 'effects', label: '효과음' },
];

export default function SettingsMenu({ theme, onThemeChange, sound, onToggleSound }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    // 메뉴를 닫는 Esc가 게임 일시정지까지 일으키지 않도록 캡처 단계에서 먼저 막는다.
    const handleKeyDown = (event) => {
      if (event.code !== 'Escape') return;
      event.stopPropagation();
      setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  const selectTheme = (id) => {
    onThemeChange(id);
    setOpen(false);
  };

  return (
    <div className="settings-menu" ref={rootRef}>
      <button
        type="button"
        className="icon-button"
        onClick={() => setOpen((value) => !value)}
        aria-label="설정"
        aria-haspopup="menu"
        aria-expanded={open}
        title="설정"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      {open && (
        <div className="settings-menu__list" role="menu" aria-label="설정">
          <span className="settings-menu__title">THEME</span>
          {THEMES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === id}
              className={
                theme === id
                  ? 'settings-menu__item settings-menu__item--active'
                  : 'settings-menu__item'
              }
              onClick={() => selectTheme(id)}
            >
              <span
                className={`settings-menu__swatch settings-menu__swatch--${id}`}
                aria-hidden="true"
              />
              {label}
            </button>
          ))}

          <span className="settings-menu__title settings-menu__title--section">SOUND</span>
          {SOUND_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="menuitemcheckbox"
              aria-checked={sound[key]}
              className="settings-menu__item"
              onClick={() => onToggleSound(key)}
            >
              {label}
              <span
                className={sound[key] ? 'switch switch--on' : 'switch'}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
