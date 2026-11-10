const LINE_TITLES = [
  null,
  { text: 'Good', className: 'clear-popup__title--good' },
  { text: 'Great!', className: 'clear-popup__title--great' },
  { text: 'Perfect!', className: 'clear-popup__title--perfect' },
  { text: 'Excellent!', className: 'clear-popup__title--excellent' },
];

// 부모에서 key={clear.id}로 렌더링해서 새로 지울 때마다 애니메이션이 다시 시작되게 한다.
export default function ClearPopup({ clear }) {
  const title = LINE_TITLES[clear.cleared];

  return (
    <div className="clear-popup" aria-live="polite">
      {clear.backToBack && <span className="clear-popup__tag">BACK-TO-BACK</span>}
      {clear.tSpin && <span className="clear-popup__tspin">T-SPIN</span>}
      {title && <span className={`clear-popup__title ${title.className}`}>{title.text}</span>}
      {clear.combo >= 2 && (
        <span className="clear-popup__combo">
          {clear.combo} COMBO ×{clear.combo}
        </span>
      )}
      {clear.allClear && <span className="clear-popup__all-clear">ALL CLEAR</span>}
      <span className="clear-popup__points">+{clear.points.toLocaleString()}</span>
      {clear.levelUp && <span className="clear-popup__level">LEVEL {clear.levelUp}</span>}
    </div>
  );
}
