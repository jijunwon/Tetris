import { useAuth } from './hooks/useAuth.js';
import { useTetris } from './hooks/useTetris.js';
import { useRanking } from './hooks/useRanking.js';
import { NEXT_PREVIEW_COUNT } from './game/constants.js';
import AuthForm from './components/AuthForm.jsx';
import Board from './components/Board.jsx';
import Controls from './components/Controls.jsx';
import Overlay from './components/Overlay.jsx';
import Panel from './components/Panel.jsx';
import PiecePreview from './components/PiecePreview.jsx';
import Ranking from './components/Ranking.jsx';
import Score from './components/Score.jsx';
import UserBar from './components/UserBar.jsx';

export default function App() {
  const auth = useAuth();
  const { state, start, reset, togglePause } = useTetris(Boolean(auth.user));
  const { ranking, rankingFailed, latestId, saveStatus } = useRanking(
    state.status,
    state.score,
    state.lines,
  );

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
      <h1 className="app__title">TETRIS</h1>
      {auth.user && <UserBar username={auth.user.username} onLogout={handleLogout} />}
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
          {boardOverlay}
        </div>

        <aside className="sidebar">
          <Panel title="NEXT">
            {state.queue.slice(0, NEXT_PREVIEW_COUNT).map((type, index) => (
              <PiecePreview key={index} type={type} />
            ))}
          </Panel>
          <Ranking ranking={ranking} failed={rankingFailed} latestId={latestId} />
        </aside>
      </div>
    </main>
  );
}
