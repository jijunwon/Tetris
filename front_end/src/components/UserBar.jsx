export default function UserBar({ username, onLogout }) {
  return (
    <div className="user-bar">
      <span className="user-bar__name">{username}</span>
      <button type="button" className="link-button" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  );
}
