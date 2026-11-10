export default function UserBar({ nickname, username, onLogout }) {
  const displayName = nickname ?? username;

  return (
    <div className="user-bar">
      <div className="user-bar__info">
        <span className="user-bar__label">PLAYER</span>
        <span className="user-bar__name" title={`${displayName} (${username})`}>
          {displayName}
        </span>
      </div>
      <button
        type="button"
        className="icon-button icon-button--danger"
        onClick={onLogout}
        aria-label="로그아웃"
        title="로그아웃"
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
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
