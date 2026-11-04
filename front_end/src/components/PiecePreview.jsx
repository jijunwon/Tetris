import { PIECES } from '../game/pieces.js';
import Cell from './Cell.jsx';

function trimShape(shape) {
  const rows = shape.filter((row) => row.some(Boolean));
  const cols = rows[0].map((_, x) => x).filter((x) => rows.some((row) => row[x]));
  return rows.map((row) => cols.map((x) => row[x]));
}

export default function PiecePreview({ type, dimmed = false }) {
  if (!type) return <div className="preview preview--empty" />;

  const shape = trimShape(PIECES[type].shape);

  return (
    <div className={dimmed ? 'preview preview--dimmed' : 'preview'}>
      <div className="preview__grid" style={{ '--cols': shape[0].length }}>
        {shape.map((row, y) =>
          row.map((filled, x) => <Cell key={`${y}-${x}`} type={filled ? type : null} />),
        )}
      </div>
    </div>
  );
}
