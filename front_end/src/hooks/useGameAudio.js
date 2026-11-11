import { useEffect, useRef } from 'react';
import { STATUS } from '../game/constants.js';
import { setMasterVolume } from '../audio/engine.js';
import { getMusicTempo } from '../audio/korobeiniki.js';
import { createMusicPlayer } from '../audio/music.js';
import { playSound, preloadSounds } from '../audio/sfx.js';
import { getSoundEvents } from '../audio/soundEvents.js';

export function useGameAudio(state, { music, effects, volume, muted }) {
  const previous = useRef(state);
  const player = useRef(null);
  if (!player.current) player.current = createMusicPlayer();

  useEffect(() => {
    setMasterVolume(muted ? 0 : volume);
  }, [volume, muted]);

  useEffect(() => {
    const prev = previous.current;
    previous.current = state;
    if (effects) getSoundEvents(prev, state).forEach(playSound);
  }, [state, effects]);

  // 새 판이면 음악을 처음부터. 아래 재생 effect보다 먼저 와야 새 판 첫 음부터 시작한다.
  useEffect(() => {
    player.current.restart();
  }, [state.gameId]);

  useEffect(() => {
    player.current.setTempo(getMusicTempo(state.level));
  }, [state.level]);

  useEffect(() => {
    if (state.status === STATUS.PLAYING) preloadSounds();
    if (music && state.status === STATUS.PLAYING) player.current.play();
    else player.current.pause();
  }, [music, state.status, state.gameId]);

  useEffect(() => () => player.current.pause(), []);
}
