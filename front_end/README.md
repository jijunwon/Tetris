# Tetris Front-end

React + Vite로 만든 테트리스입니다.

## 실행

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 게임 로직 단위 테스트
npm run build   # dist/ 에 배포용 파일 생성
```

## 구조

```text
src/
├── game/          # 순수 게임 로직 (React·DOM에 의존하지 않음)
│   ├── constants.js   보드 크기, 점수표, 레벨별 속도
│   ├── random.js      시드 기반 난수
│   ├── pieces.js      블록 7종, 회전, 7-bag 생성
│   ├── board.js       충돌 판정, 고정, 줄 삭제, 드롭 위치
│   └── game.js        상태와 리듀서 (이동·회전·드롭·홀드·일시정지·게임 오버)
├── hooks/         # React와 게임 로직 연결
│   ├── useTetris.js            useReducer + 루프 + 키 입력 조합
│   ├── useGameLoop.js          requestAnimationFrame 기반 낙하 타이머
│   └── useKeyboardControls.js  키 → 액션 매핑
└── components/    # 화면 표시만 담당
    ├── Board.jsx, Cell.jsx, PiecePreview.jsx
    └── Panel.jsx, Stats.jsx, Controls.jsx, Overlay.jsx
```

## 조작

| 키 | 동작 |
| --- | --- |
| ← → | 이동 |
| ↑ / X | 회전 |
| ↓ | 소프트 드롭 |
| Space | 하드 드롭 |
| C / Shift | 홀드 |
| P / Esc | 일시정지 |
| Enter | 시작 / 재시작 |
