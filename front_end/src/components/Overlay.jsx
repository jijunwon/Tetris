import { STATUS } from '../game/constants.js';

const CONTENT = {
  [STATUS.READY]: { title: 'TETRIS', button: '시작하기' },
  [STATUS.PAUSED]: { title: '일시정지', button: '계속하기' },
  [STATUS.OVER]: { title: 'GAME OVER', button: '다시 하기' },
};

export default function Overlay({ status, score, onStart, onResume }) {
  const content = CONTENT[status];
  if (!content) return null;

  const isPaused = status === STATUS.PAUSED;

  return (
    <div className="overlay">
      <h2 className="overlay__title">{content.title}</h2>
      {status === STATUS.OVER && <p className="overlay__score">점수 {score.toLocaleString()}</p>}
      <button type="button" className="overlay__button" onClick={isPaused ? onResume : onStart}>
        {content.button}
      </button>
      <p className="overlay__hint">{isPaused ? 'P 또는 Esc로 계속' : 'Enter로 시작'}</p>
    </div>
  );
}
