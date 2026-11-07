import Panel from './Panel.jsx';

export default function Ranking({ ranking, latestId }) {
  return (
    <Panel title="RANKING" className="sidebar__bottom">
      {ranking.length === 0 ? (
        <p className="ranking__empty">기록 없음</p>
      ) : (
        <ol className="ranking">
          {ranking.map((entry, index) => (
            <li
              key={entry.id}
              className={entry.id === latestId ? 'ranking__item ranking__item--latest' : 'ranking__item'}
            >
              <span className="ranking__rank">{index + 1}</span>
              <span className="ranking__name">{entry.nickname || '-'}</span>
              <span className="ranking__score">{entry.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
