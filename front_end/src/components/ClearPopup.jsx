const LINE_NAMES = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS'];

function getTitle({ cleared, tSpin }) {
  if (tSpin) return cleared > 0 ? `T-SPIN ${LINE_NAMES[cleared]}` : 'T-SPIN';
  return LINE_NAMES[cleared];
}

function getTitleClass({ cleared, tSpin }) {
  if (tSpin) return 'clear-popup__title clear-popup__title--tspin';
  if (cleared === 4) return 'clear-popup__title clear-popup__title--tetris';
  return 'clear-popup__title';
}

// 부모에서 key={clear.id}로 렌더링해서 새로 지울 때마다 애니메이션이 다시 시작되게 한다.
export default function ClearPopup({ clear }) {
  return (
    <div className="clear-popup" aria-live="polite">
      {clear.backToBack && <span className="clear-popup__tag">BACK-TO-BACK</span>}
      <span className={getTitleClass(clear)}>{getTitle(clear)}</span>
      {clear.combo > 0 && <span className="clear-popup__combo">{clear.combo} COMBO</span>}
      {clear.allClear && <span className="clear-popup__all-clear">ALL CLEAR</span>}
      <span className="clear-popup__points">+{clear.points.toLocaleString()}</span>
      {clear.levelUp && <span className="clear-popup__level">LEVEL {clear.levelUp}</span>}
    </div>
  );
}
