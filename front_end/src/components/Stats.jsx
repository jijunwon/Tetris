import { useElapsedTime } from '../hooks/useElapsedTime.js';

// 0:00 형식 (분:초)
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function Stats({ level, lines, status }) {
  const elapsed = useElapsedTime(status);

  const stats = [
    ['LEVEL', level],
    ['LINES', lines],
    ['TIME', formatTime(elapsed)],
  ];

  return (
    <dl className="stats">
      {stats.map(([label, value]) => (
        <div key={label} className="stats__item">
          <dt>{label}</dt>
          <dd className="stats__value">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
