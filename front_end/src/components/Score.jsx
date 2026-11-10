export default function Score({ score }) {
  return (
    <div className="score">
      <span className="score__label">SCORE</span>
      <span className="score__value">{score.toLocaleString()}</span>
    </div>
  );
}
