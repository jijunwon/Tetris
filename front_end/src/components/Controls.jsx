import Panel from './Panel.jsx';

const CONTROLS = [
  ['← →', '이동'],
  ['↑ / X', '회전'],
  ['↓', '소프트 드롭'],
  ['Space', '하드 드롭'],
  ['C / Shift', '홀드'],
  ['P / Esc', '일시정지'],
];

export default function Controls() {
  return (
    <Panel title="CONTROLS" className="panel--compact sidebar__bottom">
      <ul className="controls">
        {CONTROLS.map(([key, label]) => (
          <li key={key}>
            <kbd>{key}</kbd>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
