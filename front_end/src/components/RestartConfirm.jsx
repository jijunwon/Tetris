import { useEffect } from 'react';

export default function RestartConfirm({ showLossWarning, onConfirm, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== 'Escape') return;
      event.preventDefault();
      onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="overlay" role="alertdialog" aria-labelledby="restart-title">
      <h2 id="restart-title" className="overlay__title overlay__title--question">
        다시 하겠습니까?
      </h2>
      {showLossWarning && <p className="overlay__hint">지금 게임의 기록은 저장되지 않습니다</p>}
      <div className="overlay__actions">
        <button type="button" className="overlay__button" onClick={onConfirm} autoFocus>
          예
        </button>
        <button
          type="button"
          className="overlay__button overlay__button--secondary"
          onClick={onCancel}
        >
          아니오
        </button>
      </div>
    </div>
  );
}
