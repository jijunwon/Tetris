export default function VolumeControl({ volume, muted, onToggleMute, onVolumeChange }) {
  const percent = Math.round(volume * 100);
  const silent = muted || percent === 0;

  const handleMuteClick = (event) => {
    // 포커스가 남아 있으면 게임 중 Enter가 이 버튼을 다시 눌러 버린다.
    event.currentTarget.blur();
    onToggleMute();
  };

  return (
    <div className="volume">
      <button
        type="button"
        className="icon-button"
        onClick={handleMuteClick}
        aria-label={muted ? '음소거 해제' : '음소거'}
        aria-pressed={muted}
        title={muted ? '음소거 해제' : '음소거'}
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
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          {silent && <line x1="2" y1="2" x2="22" y2="22" />}
        </svg>
      </button>
      <div className="volume__panel">
        <input
          type="range"
          className="volume__slider"
          min="0"
          max="100"
          step="5"
          value={muted ? 0 : percent}
          style={{ '--fill': `${muted ? 0 : percent}%` }}
          onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
          // 슬라이더에 포커스가 남으면 방향키가 블록 대신 볼륨을 움직이므로, 마우스로 놓으면 포커스를 뺀다.
          onPointerUp={(event) => event.currentTarget.blur()}
          aria-label="볼륨"
        />
        <span className="volume__value">{muted ? 0 : percent}</span>
      </div>
    </div>
  );
}
