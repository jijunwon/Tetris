import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchTopScores, saveScore } from '../api.js';
import { RANKING_SIZE, STATUS } from '../game/constants.js';

export const SAVE_STATUS = Object.freeze({
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  FAILED: 'failed',
});

export function useRanking(status, score, lines) {
  const [ranking, setRanking] = useState([]);
  const [rankingFailed, setRankingFailed] = useState(false);
  const [latestId, setLatestId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.IDLE);
  const savedThisGame = useRef(false);

  const refreshRanking = useCallback(async () => {
    try {
      setRanking(await fetchTopScores(RANKING_SIZE));
      setRankingFailed(false);
    } catch {
      setRankingFailed(true);
    }
  }, []);

  useEffect(() => {
    refreshRanking();
  }, [refreshRanking]);

  useEffect(() => {
    if (status === STATUS.PLAYING) {
      savedThisGame.current = false;
      setSaveStatus(SAVE_STATUS.IDLE);
      return;
    }
    if (status !== STATUS.OVER || savedThisGame.current || score <= 0) return;

    savedThisGame.current = true;
    setSaveStatus(SAVE_STATUS.SAVING);
    saveScore(score, lines)
      .then((saved) => {
        setLatestId(saved.id);
        setSaveStatus(SAVE_STATUS.SAVED);
        refreshRanking();
      })
      .catch(() => setSaveStatus(SAVE_STATUS.FAILED));
  }, [status, score, lines, refreshRanking]);

  return { ranking, rankingFailed, latestId, saveStatus };
}
