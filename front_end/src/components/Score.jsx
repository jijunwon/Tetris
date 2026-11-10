import { useElapsedTime } from '../hooks/useElapsedTime.js';

export default function Score({ score, level, lines, status }) {
  const elapsed = useElapsedTime(status);

  const stats = [
    ['SCORE', score.toLocaleString(), 'stats__value--score'],
    ['LEVEL', level],
    ['LINES', lines],
    ['TIME', `${(elapsed / 1000).toFixed(1)}s`],
  ];

  return (
    <dl className="stats">
      {stats.map(([label, value, modifier]) => (
        <div key={label} className="stats__item">
          <dt>{label}</dt>
          <dd className={modifier ? `stats__value ${modifier}` : 'stats__value'}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
