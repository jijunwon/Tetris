import Panel from './Panel.jsx';

export default function Stats({ score, level, lines }) {
  return (
    <Panel title="STATS">
      <dl className="stats">
        <dt>점수</dt>
        <dd>{score.toLocaleString()}</dd>
        <dt>레벨</dt>
        <dd>{level}</dd>
        <dt>줄</dt>
        <dd>{lines}</dd>
      </dl>
    </Panel>
  );
}
