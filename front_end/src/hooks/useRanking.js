import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, fetchTopScores, saveScore } from '../api.js';
import { RANKING_SIZE, STATUS } from '../game/constants.js';

export const SAVE_STATUS = Object.freeze({
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  FAILED: 'failed',
  RATE_LIMITED: 'rate_limited',
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
      .catch((error) => {
        if (error instanceof ApiError && error.status === 429) {
          setSaveStatus(SAVE_STATUS.RATE_LIMITED);
          return;
        }
        setSaveStatus(SAVE_STATUS.FAILED);
      });
  }, [status, score, lines, refreshRanking]);

  return { ranking, rankingFailed, latestId, saveStatus };
}
