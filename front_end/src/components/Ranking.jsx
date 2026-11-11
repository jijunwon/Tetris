import Panel from './Panel.jsx';

const MEDAL_CLASSES = ['ranking__item--gold', 'ranking__item--silver', 'ranking__item--bronze'];

function getItemClass(index, isLatest) {
  const classes = ['ranking__item'];
  if (MEDAL_CLASSES[index]) classes.push(MEDAL_CLASSES[index]);
  if (isLatest) classes.push('ranking__item--latest');
  return classes.join(' ');
}

function Crown() {
  return (
    <svg
      className="ranking__crown"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="currentColor"
      role="img"
      aria-label="1위"
    >
      <path d="M3 7.5 7.5 11 12 4l4.5 7L21 7.5 19 18H5L3 7.5Z" />
      <rect x="5" y="19.5" width="14" height="2" rx="1" />
    </svg>
  );
}

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
          <li key={entry.id} className={getItemClass(index, entry.id === latestId)}>
            <span className="ranking__rank">{index === 0 ? <Crown /> : index + 1}</span>
            <span className="ranking__name">{entry.nickname ?? entry.username}</span>
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
