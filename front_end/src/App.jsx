import { useCallback, useRef, useState } from 'react';
import { useAuth } from './hooks/useAuth.js';
import { useTetris } from './hooks/useTetris.js';
import { useRanking } from './hooks/useRanking.js';
import { useBoardShake } from './hooks/useBoardShake.js';
import { useTheme } from './hooks/useTheme.js';
import { useGameAudio } from './hooks/useGameAudio.js';
import { useSoundSettings } from './hooks/useSoundSettings.js';
import { NEXT_PREVIEW_COUNT, STATUS } from './game/constants.js';
import AuthForm from './components/AuthForm.jsx';
import Board from './components/Board.jsx';
import ClearPopup from './components/ClearPopup.jsx';
import Controls from './components/Controls.jsx';
import Overlay from './components/Overlay.jsx';
import Panel from './components/Panel.jsx';
import PiecePreview from './components/PiecePreview.jsx';
import Ranking from './components/Ranking.jsx';
import RestartButton from './components/RestartButton.jsx';
import RestartConfirm from './components/RestartConfirm.jsx';
import Score from './components/Score.jsx';
import Stats from './components/Stats.jsx';
import SettingsMenu from './components/SettingsMenu.jsx';
import UserBar from './components/UserBar.jsx';
import VolumeControl from './components/VolumeControl.jsx';

export default function App() {
  const auth = useAuth();
  const [theme, setTheme] = useTheme();
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  // 확인 창을 띄우면서 게임을 멈췄는지. '아니오'를 누르면 이때만 다시 진행한다.
  const pausedForConfirm = useRef(false);
  const { state, start, reset, togglePause } = useTetris(
    Boolean(auth.user) && !confirmingRestart,
  );
  const { ranking, rankingFailed, latestId, saveStatus } = useRanking(
    state.status,
    state.score,
    state.lines,
  );
  const boardRef = useBoardShake(state.hardDropCount, state.lastClear);
  const [sound, toggleSound, setVolume] = useSoundSettings();
  useGameAudio(state, sound);

  const openRestartConfirm = () => {
    if (state.status === STATUS.PLAYING) {
      togglePause();
      pausedForConfirm.current = true;
    }
    setConfirmingRestart(true);
  };

  const confirmRestart = useCallback(() => {
    pausedForConfirm.current = false;
    setConfirmingRestart(false);
    start();
  }, [start]);

  const cancelRestart = useCallback(() => {
    if (pausedForConfirm.current) togglePause();
    pausedForConfirm.current = false;
    setConfirmingRestart(false);
  }, [togglePause]);

  const handleLogout = () => {
    pausedForConfirm.current = false;
    setConfirmingRestart(false);
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
  } else if (confirmingRestart) {
    boardOverlay = (
      <RestartConfirm
        showLossWarning={state.status !== STATUS.OVER}
        onConfirm={confirmRestart}
        onCancel={cancelRestart}
      />
    );
  } else {
    boardOverlay = (
      <Overlay
        status={state.status}
        saveStatus={saveStatus}
        onStart={start}
        onResume={togglePause}
      />
    );
  }

  return (
    <main className="app">
      <header className="app__header">
        <div className="app__volume">
          <VolumeControl
            volume={sound.volume}
            muted={sound.muted}
            onToggleMute={() => toggleSound('muted')}
            onVolumeChange={setVolume}
          />
        </div>
        <h1 className="app__title">TETRIS</h1>
        <div className="app__settings">
          <RestartButton
            disabled={!auth.user || state.status === STATUS.READY || confirmingRestart}
            onClick={openRestartConfirm}
          />
          <SettingsMenu
            theme={theme}
            onThemeChange={setTheme}
            sound={sound}
            onToggleSound={toggleSound}
          />
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar__header">
            <Score score={state.score} />
          </div>
          <Panel title="HOLD">
            <PiecePreview type={state.hold} dimmed={!state.canHold} />
          </Panel>
          <Stats
            level={state.level}
            lines={state.lines}
            status={state.status}
            gameId={state.gameId}
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
          <div className="sidebar__header">
            {auth.user && (
              <UserBar
                nickname={auth.user.nickname}
                username={auth.user.username}
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
