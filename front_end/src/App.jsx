import { useAuth } from './hooks/useAuth.js';
import { useTetris } from './hooks/useTetris.js';
import { useRanking } from './hooks/useRanking.js';
import { useBoardShake } from './hooks/useBoardShake.js';
import { useTheme } from './hooks/useTheme.js';
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
import Stats from './components/Stats.jsx';
import UserBar from './components/UserBar.jsx';

export default function App() {
  const auth = useAuth();
  const [theme, setTheme] = useTheme();
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
      <h1 className="app__title">TETRIS</h1>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar__header">
            <Score score={state.score} />
          </div>
          <Panel title="HOLD">
            <PiecePreview type={state.hold} dimmed={!state.canHold} />
          </Panel>
          <Stats level={state.level} lines={state.lines} status={state.status} />
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
          <div className="sidebar__header">
            {auth.user && (
              <UserBar
                nickname={auth.user.nickname}
                username={auth.user.username}
                theme={theme}
                onThemeChange={setTheme}
                onLogout={handleLogout}
              />
            )}
          </div>
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
