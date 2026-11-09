import Panel from './Panel.jsx';

export default function Ranking({ ranking, failed, latestId }) {
  let body;
  if (failed) {
    body = <p className="ranking__empty">랭킹을 불러오지 못했습니다</p>;
  } else if (ranking.length === 0) {
    body = <p className="ranking__empty">기록 없음</p>;
  } else {
    body = (
      <ol className="ranking">
        {ranking.map((entry, index) => (
          <li
            key={entry.id}
            className={entry.id === latestId ? 'ranking__item ranking__item--latest' : 'ranking__item'}
          >
            <span className="ranking__rank">{index + 1}</span>
            <span className="ranking__name">{entry.username}</span>
            <span className="ranking__score">{entry.score.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <Panel title="RANKING" className="sidebar__bottom">
      {body}
    </Panel>
  );
}
