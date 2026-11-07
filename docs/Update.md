# 2026-11-04

### 프로젝트 준비
- 로드맵 정리 (`docs/TODO.md`), 단계별 브랜치 생성

#### 프론트엔드 테트리스 구현 (React + Vite)
- 블록 이동·회전·드롭, 줄 삭제, 점수·레벨, 게임 오버
- 홀드, 다음 블록 미리보기, 고스트 블록
- 게임 로직 단위 테스트 (Vitest)

# 2026-11-06

### Spring 준비
- Spring boot 설치 및 연결확인
- hello tetris


# 2026-11-07

### Spring
- DB(H2) 연결 확인

### API
- POST /api/scores: 점수 저장 (음수 점수는 400으로 거절)
- GET /api/scores/top?limit=10: 점수 높은 순으로 랭킹 조회
- H2 인메모리 DB와 H2 콘솔 설정

### 회원가입 / 로그인
- `POST /api/auth/signup`: 아이디 + 비밀번호, 비밀번호는 BCrypt로 저장
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`: 세션 쿠키로 로그인 유지
- 점수 저장은 로그인한 사용자만 가능하고, 랭킹 응답에 아이디가 포함됨
- 서버에서 회원가입, 로그인, 점수 저장, 랭킹 조회를 확인했다. 같은 아이디로 다시 가입하면 거절됨
- `feature/signup-login` 브랜치에 커밋하고 푸시
