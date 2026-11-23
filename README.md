# Tetris Project

로그인·랭킹이 있는 테트리스 웹 게임. React 프론트와 Spring Boot 백엔드를 하나의 JAR로 묶어 AWS EC2에 배포한다.

- **운영 URL**: https://jijunwon-tetris.duckdns.org
- **배포 방식**: same-origin — `front_end` 빌드 결과를 Spring Boot JAR의 `static/`에 넣고 Nginx → JAR → MySQL

자세한 로드맵·일지는 `docs/`를 본다. 이 파일만으로 구조·스택·실행 방법을 파악할 수 있게 정리했다.

---

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 프론트 | React 19, Vite, Vitest |
| 백엔드 | Java 21, Spring Boot, Spring Security, Spring Data JPA, Validation |
| DB | 로컬 H2 / 운영 MySQL 8 |
| 캐시 | Spring Cache + Caffeine (`topScores`, 약 60초) — Redis 아님 |
| 인증 | 세션 쿠키, 비밀번호 BCrypt |
| 웹 서버 | Nginx (HTTPS, reverse proxy, gzip, rate limit, 정적 캐시) |
| 인프라 | AWS EC2 (Ubuntu), DuckDNS, Let's Encrypt |
| CI/CD | GitHub Actions → 빌드·테스트 → SCP → systemd 재시작 |
| 부하 테스트 | k6 (`load-test/`) |

---

## 아키텍처 (한눈에)

```text
Browser (React)
    │  HTTPS
    ▼
Nginx  ── rate limit / gzip / SSL
    │  proxy → :8080
    ▼
Spring Boot JAR
  ├── static/     ← Vite 빌드 결과
  ├── /api/auth   ← 회원가입·로그인·세션
  └── /api/scores ← 점수 저장·상위 랭킹 (Caffeine 캐시)
    │
    ▼
MySQL (Users, Scores)   ※ 로컬 기본 프로필은 H2
```

개발 시에는 Vite(`:5173`)가 `/api`를 `:8080`으로 프록시해서 쿠키가 같은 흐름으로 동작한다.

---

## 폴더 구조

```text
Tetris/
├── front_end/                 # React + Vite 게임 UI
│   └── src/
│       ├── game/              # 순수 게임 로직 (보드·피스·점수·리듀서)
│       ├── hooks/             # useTetris, useAuth, useRanking, 오디오 등
│       ├── components/        # Board, Ranking, AuthForm …
│       ├── audio/             # BGM·효과음
│       ├── api.js             # /api 호출
│       ├── theme.js           # 라이트·다크·네온
│       └── App.jsx
├── back_end/                  # Spring Boot
│   └── src/main/java/com/example/tetris/
│       ├── controller/        # AuthController, ScoreController
│       ├── service/
│       ├── repository/
│       ├── domain/            # User, Score
│       ├── dto/
│       ├── config/            # Security, Cache
│       └── exception/
├── deploy/nginx/              # EC2에 복사하는 Nginx 설정
├── load-test/                 # k6 스크립트·결과
├── docs/
│   ├── PLAN.md                # 전체 로드맵
│   ├── TODO.md                # 바로 다음 할 일
│   └── Update.md              # 날짜별 작업 기록
├── .github/workflows/         # 자동 배포
└── README.md                  # 지금 이 파일
```

`back_end`의 `bootJar`가 `front_end/dist`를 JAR `static/`에 넣는다. 배포 산출물은 JAR 하나다.

---

## 주요 기능

- 테트리스 본편: 7종 블록, 홀드, 고스트, 콤보·Back-to-Back·T-스핀·All Clear
- 로그인 후 플레이, 게임 오버 시 서버에 점수 저장
- 닉네임·아이디 중복 금지, 랭킹에는 닉네임 표시 (1~3위 강조)
- 테마(라이트·다크·네온), 배경음악·효과음
- 트래픽: Nginx rate limit, 정적 파일 캐시, 랭킹 Caffeine 캐시

### API

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/auth/signup` | 회원가입 (닉네임·아이디·비밀번호) |
| POST | `/api/auth/login` | 로그인 (세션 쿠키) |
| GET | `/api/auth/me` | 현재 로그인 사용자 |
| POST | `/api/scores` | 점수 저장 (로그인 필요) |
| GET | `/api/scores/top?limit=10` | 상위 랭킹 |

### 조작

| 키 | 동작 |
| --- | --- |
| ← → | 이동 |
| ↑ / X | 회전 |
| ↓ | 소프트 드롭 |
| Space | 하드 드롭 |
| C / Shift | 홀드 |
| P / Esc | 일시정지 |
| Enter | 시작 / 재시작 |

---

## 로컬 실행

**개발 (프론트·백 분리)**

```powershell
# 터미널 1 — 백엔드 (기본: H2)
cd back_end
.\gradlew bootRun

# 터미널 2 — 프론트
cd front_end
npm install
npm run dev
# http://localhost:5173  (/api → :8080)
```

**배포와 같게 JAR 하나로**

```powershell
cd back_end
.\gradlew build
java -jar build\libs\tetris-0.0.1-SNAPSHOT.jar
# http://localhost:8080
```

**로컬 MySQL (prod 프로필)**

```powershell
$env:DB_PASSWORD="비밀번호"
.\gradlew bootRun --args='--spring.profiles.active=prod'
```

테스트: `front_end`에서 `npm test`, `back_end`에서 `.\gradlew test`.

---

## 배포 · CI/CD

1. `main`에 push → GitHub Actions가 프론트·백 테스트 후 JAR 빌드
2. EC2 SSH를 잠시 연 뒤 JAR를 `/opt/tetris/app.jar`로 업로드하고 `tetris` 서비스 재시작
3. Nginx가 80/443 → `8080`으로 프록시, HTTPS는 Let's Encrypt

Nginx 설정 원본은 `deploy/nginx/`에 있다. 부하 테스트 기준·비교는 `load-test/results/`를 본다.

---

## 문서 역할

| 파일 | 용도 |
| --- | --- |
| `docs/PLAN.md` | 단계별 로드맵·결정 사항 |
| `docs/TODO.md` | 다음에 할 일 체크리스트 |
| `docs/Update.md` | 날짜별 작업 기록 |

진행 중·예정: 실시간 랭킹(SSE), Redis 검토, Actuator 등은 `PLAN.md` 7~8단계 참고.
