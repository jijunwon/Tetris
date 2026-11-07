import { useTetris } from './hooks/useTetris.js';
import { useRanking } from './hooks/useRanking.js';
import { NEXT_PREVIEW_COUNT } from './game/constants.js';
import Board from './components/Board.jsx';
import Controls from './components/Controls.jsx';
import Overlay from './components/Overlay.jsx';
import Panel from './components/Panel.jsx';
import PiecePreview from './components/PiecePreview.jsx';
import Ranking from './components/Ranking.jsx';
import Score from './components/Score.jsx';

export default function App() {
  const { state, start, togglePause } = useTetris();
  const { ranking, latestId, canSubmit, lastNickname, submitScore } = useRanking(
    state.status,
    state.score,
  );

  return (
    <main className="app">
      <h1 className="app__title">TETRIS</h1>
      <div className="layout">
        <aside className="sidebar">
          <Panel title="HOLD">
            <PiecePreview type={state.hold} dimmed={!state.canHold} />
          </Panel>
          <Score score={state.score} />
          <Controls />
        </aside>

        <div className="board-wrapper">
          <Board board={state.board} current={state.current} />
          <Overlay
            status={state.status}
            score={state.score}
            canSubmit={canSubmit}
            defaultNickname={lastNickname}
            onSubmitScore={submitScore}
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
          <Ranking ranking={ranking} latestId={latestId} />
        </aside>
      </div>
    </main>
  );
}
