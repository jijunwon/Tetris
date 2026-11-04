import { useState } from 'react';
import { STATUS } from '../game/constants.js';
import { NICKNAME_MAX_LENGTH } from '../game/ranking.js';

const CONTENT = {
  [STATUS.READY]: { title: 'TETRIS', button: '시작하기' },
  [STATUS.PAUSED]: { title: '일시정지', button: '계속하기' },
  [STATUS.OVER]: { title: 'GAME OVER', button: '다시 하기' },
};

function NicknameForm({ defaultNickname, onSubmit }) {
  const [nickname, setNickname] = useState(defaultNickname);
  const trimmed = nickname.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <form className="nickname-form" onSubmit={handleSubmit}>
      <input
        className="nickname-form__input"
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        maxLength={NICKNAME_MAX_LENGTH}
        placeholder="닉네임"
        aria-label="닉네임"
        autoFocus
      />
      <button type="submit" className="nickname-form__button" disabled={!trimmed}>
        등록
      </button>
    </form>
  );
}

export default function Overlay({ status, score, canSubmit, defaultNickname, onSubmitScore, onStart, onResume }) {
  const content = CONTENT[status];
  if (!content) return null;

  const isPaused = status === STATUS.PAUSED;
  const hint = isPaused ? 'P 또는 Esc로 계속' : canSubmit ? 'Enter로 등록' : 'Enter로 시작';

  return (
    <div className="overlay">
      <h2 className="overlay__title">{content.title}</h2>
      {status === STATUS.OVER && <p className="overlay__score">점수 {score.toLocaleString()}</p>}
      {canSubmit && <NicknameForm defaultNickname={defaultNickname} onSubmit={onSubmitScore} />}
      <button type="button" className="overlay__button" onClick={isPaused ? onResume : onStart}>
        {content.button}
      </button>
      <p className="overlay__hint">{hint}</p>
    </div>
  );
}
