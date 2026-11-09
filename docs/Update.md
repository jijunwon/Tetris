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


# 2026-11-09

### 브랜치
- `feature/signup-login`을 `main`에 머지
- `feature/ranking-integration`을 최신 `main`으로 맞추고 3단계 시작

### 프론트엔드 ↔ 백엔드 연결
- Vite 프록시로 `/api` 요청을 백엔드(8080)로 전달
- `api.js`: 회원가입·로그인·로그아웃·내 정보·점수 저장·랭킹 조회 함수
- 로그인 / 회원가입 폼 추가, 로그인해야 게임 시작, 로그아웃하면 게임 초기화
- 게임 오버 시 점수를 서버에 자동 저장, 랭킹은 서버에서 조회해 아이디로 표시
- `localStorage` 랭킹과 닉네임 입력칸 제거

### 배포 준비
- `bootJar`가 프론트를 빌드해 JAR 안의 `static/`에 넣도록 설정
- 로그인 검사를 `/api/**`에만 적용해서 게임 페이지가 막히지 않게 수정
- `.\gradlew build`로 만든 JAR 하나로 게임과 API가 함께 열리는 것을 확인
