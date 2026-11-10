export default function Score({ score, level, lines }) {
  return (
    <div className="score">
      <span className="score__label">SCORE</span>
      <span className="score__value">{score.toLocaleString()}</span>
      <dl className="stats">
        <div className="stats__item">
          <dt>LEVEL</dt>
          <dd>{level}</dd>
        </div>
        <div className="stats__item">
          <dt>LINES</dt>
          <dd>{lines}</dd>
        </div>
      </dl>
    </div>
  );
}
