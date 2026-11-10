import { memo } from 'react';
import { getCellColor } from '../game/pieces.js';

function Cell({ type, ghost = false }) {
  if (!type) return <div className="cell" />;

  return (
    <div
      className={ghost ? 'cell cell--ghost' : 'cell cell--filled'}
      style={{ '--cell-color': getCellColor(type) }}
    />
  );
}

export default memo(Cell);
