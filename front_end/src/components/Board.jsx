import { useMemo } from 'react';
import { COLS, ROWS } from '../game/constants.js';
import { getDropPosition } from '../game/board.js';
import { PIECES, getPieceCells } from '../game/pieces.js';
import { useSoftDropTrail } from '../hooks/useSoftDropTrail.js';
import Cell from './Cell.jsx';

function buildGrid(board, current) {
  const grid = board.map((row) => row.map((type) => ({ type, ghost: false })));
  if (!current) return grid;

  getPieceCells(getDropPosition(board, current)).forEach(({ x, y }) => {
    if (y >= 0) grid[y][x] = { type: current.type, ghost: true };
  });
  getPieceCells(current).forEach(({ x, y }) => {
    if (y >= 0) grid[y][x] = { type: current.type, ghost: false };
  });
  return grid;
}

export default function Board({ board, current, lastClear, softDropCount }) {
  const grid = useMemo(() => buildGrid(board, current), [board, current]);
  const { trail, remove } = useSoftDropTrail(current, softDropCount);

  return (
    <div className="board" style={{ '--cols': COLS, '--rows': ROWS }}>
      {grid.map((row, y) =>
        row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell.type} ghost={cell.ghost} />),
      )}
      {trail.map((item) => (
        <div
          key={item.id}
          className="board__trail"
          style={{ '--cell-color': PIECES[item.type].color }}
          onAnimationEnd={() => remove(item.id)}
        >
          {item.cells.map(({ x, y }) => (
            <div key={`${x}-${y}`} className="board__trail-cell" style={{ '--x': x, '--y': y }} />
          ))}
        </div>
      ))}
      {lastClear?.rows.map((y) => (
        <div key={`${lastClear.id}-${y}`} className="board__flash" style={{ '--row': y }} />
      ))}
    </div>
  );
}
