import { PIECES, PIECE_TYPES } from '../game/pieces.js';

// 아이디마다 항상 같은 블록 색이 나오도록 문자열 해시로 고른다. 닉네임은 겹칠 수 있어서 아이디를 쓴다.
function getAvatarColor(username) {
  let hash = 0;
  for (const char of username) {
    hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  }
  return PIECES[PIECE_TYPES[hash % PIECE_TYPES.length]].color;
}

export default function UserBar({ nickname, username, onLogout }) {
  const displayName = nickname ?? username;

  return (
    <div className="user-bar">
      <span
        className="user-bar__avatar"
        style={{ '--cell-color': getAvatarColor(username) }}
        aria-hidden="true"
      >
        {[...displayName][0].toUpperCase()}
      </span>
      <div className="user-bar__info">
        <span className="user-bar__label">PLAYER</span>
        <span className="user-bar__name" title={`${displayName} (${username})`}>
          {displayName}
        </span>
      </div>
      <button
        type="button"
        className="user-bar__logout"
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
