export default function RestartButton({ disabled, onClick }) {
  const handleClick = (event) => {
    // 포커스가 남아 있으면 게임 중 Enter가 이 버튼을 다시 눌러 버린다.
    event.currentTarget.blur();
    onClick();
  };

  return (
    <button
      type="button"
      className="icon-button"
      onClick={handleClick}
      disabled={disabled}
      aria-label="다시 하기"
      title="다시 하기"
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
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    </button>
  );
}
