import { useAuth } from './hooks/useAuth.js';
import { useTetris } from './hooks/useTetris.js';
import { useRanking } from './hooks/useRanking.js';
import { useBoardShake } from './hooks/useBoardShake.js';
import { NEXT_PREVIEW_COUNT } from './game/constants.js';
import AuthForm from './components/AuthForm.jsx';
import Board from './components/Board.jsx';
import ClearPopup from './components/ClearPopup.jsx';
import Controls from './components/Controls.jsx';
import Overlay from './components/Overlay.jsx';
import Panel from './components/Panel.jsx';
import PiecePreview from './components/PiecePreview.jsx';
import Ranking from './components/Ranking.jsx';
import Score from './components/Score.jsx';
import Title from './components/Title.jsx';
import UserBar from './components/UserBar.jsx';

export default function App() {
  const auth = useAuth();
  const { state, start, reset, togglePause } = useTetris(Boolean(auth.user));
  const { ranking, rankingFailed, latestId, saveStatus } = useRanking(
    state.status,
    state.score,
    state.lines,
  );
  const boardRef = useBoardShake(state.hardDropCount, state.lastClear);

  const handleLogout = () => {
    reset();
    auth.logout();
  };

  let boardOverlay;
  if (auth.loading) {
    boardOverlay = (
      <div className="overlay">
        <p className="overlay__hint">불러오는 중…</p>
      </div>
    );
  } else if (!auth.user) {
    boardOverlay = <AuthForm onLogin={auth.login} onSignup={auth.signup} />;
  } else {
    boardOverlay = (
      <Overlay
        status={state.status}
        score={state.score}
        saveStatus={saveStatus}
        onStart={start}
        onResume={togglePause}
      />
    );
  }

  return (
    <main className="app">
      <Title />
      <div className="layout">
        <aside className="sidebar">
          <Panel title="HOLD">
            <PiecePreview type={state.hold} dimmed={!state.canHold} />
          </Panel>
          <Score
            score={state.score}
            level={state.level}
            lines={state.lines}
            status={state.status}
          />
          <Ranking ranking={ranking} failed={rankingFailed} latestId={latestId} />
        </aside>

        <div className="board-wrapper" ref={boardRef}>
          <Board
            board={state.board}
            current={state.current}
            lastClear={state.lastClear}
            softDropCount={state.softDropCount}
          />
          {state.lastClear && <ClearPopup key={state.lastClear.id} clear={state.lastClear} />}
          {boardOverlay}
        </div>

        <aside className="sidebar">
          {auth.user && <UserBar username={auth.user.username} onLogout={handleLogout} />}
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
