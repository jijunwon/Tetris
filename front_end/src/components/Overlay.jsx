import { STATUS } from '../game/constants.js';
import { SAVE_STATUS } from '../hooks/useRanking.js';

const CONTENT = {
  [STATUS.READY]: { title: 'TETRIS', button: '시작하기' },
  [STATUS.PAUSED]: { title: '일시정지', button: '계속하기' },
  [STATUS.OVER]: { title: 'GAME OVER', button: '다시 하기' },
};

const SAVE_MESSAGE = {
  [SAVE_STATUS.SAVING]: '기록 저장 중…',
  [SAVE_STATUS.SAVED]: '랭킹에 기록했습니다',
  [SAVE_STATUS.FAILED]: '기록을 저장하지 못했습니다',
};

export default function Overlay({ status, score, saveStatus, onStart, onResume }) {
  const content = CONTENT[status];
  if (!content) return null;

  const isPaused = status === STATUS.PAUSED;
  const isOver = status === STATUS.OVER;
  const saveMessage = isOver ? SAVE_MESSAGE[saveStatus] : null;

  return (
    <div className="overlay">
      <h2 className="overlay__title">{content.title}</h2>
      {isOver && <p className="overlay__score">점수 {score.toLocaleString()}</p>}
      {saveMessage && (
        <p
          className={
            saveStatus === SAVE_STATUS.FAILED ? 'overlay__save overlay__save--failed' : 'overlay__save'
          }
        >
          {saveMessage}
        </p>
      )}
      <button type="button" className="overlay__button" onClick={isPaused ? onResume : onStart}>
        {content.button}
      </button>
      <p className="overlay__hint">{isPaused ? 'P 또는 Esc로 계속' : 'Enter로 시작'}</p>
    </div>
  );
}
