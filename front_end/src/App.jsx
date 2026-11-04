import { useTetris } from './hooks/useTetris.js';
import { NEXT_PREVIEW_COUNT } from './game/constants.js';
import Board from './components/Board.jsx';
import Controls from './components/Controls.jsx';
import Overlay from './components/Overlay.jsx';
import Panel from './components/Panel.jsx';
import PiecePreview from './components/PiecePreview.jsx';
import Stats from './components/Stats.jsx';

export default function App() {
  const { state, start, togglePause } = useTetris();

  return (
    <main className="app">
      <h1 className="app__title">TETRIS</h1>
      <div className="layout">
        <aside className="sidebar">
          <Panel title="HOLD">
            <PiecePreview type={state.hold} dimmed={!state.canHold} />
          </Panel>
          <Stats score={state.score} level={state.level} lines={state.lines} />
        </aside>

        <div className="board-wrapper">
          <Board board={state.board} current={state.current} />
          <Overlay
            status={state.status}
            score={state.score}
            onStart={start}
            onResume={togglePause}
          />
        </div>

        <aside className="sidebar">
          <Panel title="NEXT">
            {state.queue.slice(0, NEXT_PREVIEW_COUNT).map((type, index) => (
              <PiecePreview key={index} type={type} />
            ))}
          </Panel>
          <Controls />
        </aside>
      </div>
    </main>
  );
}
