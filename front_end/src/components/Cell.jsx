import { memo } from 'react';
import { PIECES } from '../game/pieces.js';

function Cell({ type, ghost = false }) {
  if (!type) return <div className="cell" />;

  return (
    <div
      className={ghost ? 'cell cell--ghost' : 'cell cell--filled'}
      style={{ '--cell-color': PIECES[type].color }}
    />
  );
}

export default memo(Cell);
