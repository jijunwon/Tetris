// 글자마다 3×5 칸 블록으로 그리고, 테트로미노 색을 하나씩 입힌다.
const LETTERS = {
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  E: ['###', '#..', '##.', '#..', '###'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  S: ['###', '#..', '###', '..#', '###'],
};

const TITLE = [
  ['T', '#ef4444'],
  ['E', '#f97316'],
  ['T', '#facc15'],
  ['R', '#22c55e'],
  ['I', '#22d3ee'],
  ['S', '#a855f7'],
];

export default function Title() {
  return (
    <h1 className="title" aria-label="TETRIS">
      {TITLE.map(([letter, color], index) => (
        <span
          key={index}
          className="title__letter"
          style={{ '--cell-color': color }}
          aria-hidden="true"
        >
          {LETTERS[letter].flatMap((row, y) =>
            [...row].map((mark, x) => (
              <span
                key={`${y}-${x}`}
                className={mark === '#' ? 'title__block title__block--filled' : 'title__block'}
              />
            )),
          )}
        </span>
      ))}
    </h1>
  );
}
