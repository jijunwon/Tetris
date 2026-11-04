import { useCallback, useEffect, useState } from 'react';
import { STATUS } from '../game/constants.js';
import { addRankingEntry, loadRanking, saveRanking } from '../game/ranking.js';

export function useRanking(status, score) {
  const [ranking, setRanking] = useState(() => loadRanking());
  const [latestId, setLatestId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [lastNickname, setLastNickname] = useState('');

  useEffect(() => {
    if (status === STATUS.PLAYING) setSubmitted(false);
  }, [status]);

  const submitScore = useCallback(
    (nickname) => {
      const entry = { id: Date.now(), nickname, score };
      const next = addRankingEntry(loadRanking(), entry);
      saveRanking(next);
      setRanking(next);
      setLatestId(entry.id);
      setLastNickname(nickname);
      setSubmitted(true);
    },
    [score],
  );

  const canSubmit = status === STATUS.OVER && score > 0 && !submitted;

  return { ranking, latestId, canSubmit, lastNickname, submitScore };
}
