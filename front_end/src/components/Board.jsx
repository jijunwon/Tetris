import { useMemo } from 'react';
import { COLS, ROWS } from '../game/constants.js';
import { getDropPosition } from '../game/board.js';
import { getPieceCells } from '../game/pieces.js';
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

export default function Board({ board, current, lastClear }) {
  const grid = useMemo(() => buildGrid(board, current), [board, current]);

  return (
    <div className="board" style={{ '--cols': COLS, '--rows': ROWS }}>
      {grid.map((row, y) =>
        row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell.type} ghost={cell.ghost} />),
      )}
      {lastClear?.rows.map((y) => (
        <div key={`${lastClear.id}-${y}`} className="board__flash" style={{ '--row': y }} />
      ))}
    </div>
  );
}
