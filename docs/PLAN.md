# PLAN

테트리스 게임(React) + Spring Boot 백엔드(회원가입, 랭킹)를 만들어 AWS EC2에 배포하는 프로젝트의 전체 로드맵.

## 진행 상황

| 단계 | 내용 | 상태 | 브랜치 | 예상 기간 |
| --- | --- | --- | --- | --- |
| 0 | 개발 환경 준비 | 진행 중 | - | - |
| 1 | 테트리스 (프론트엔드) | 완료 | `main` | 3~7일 |
| 2 | Spring Boot 백엔드 (랭킹 API, 회원가입/로그인) | 완료 | `feature/backend-setup`, `feature/signup-login` | 3~5일 (2~3단계 합산) |
| 3 | 프론트엔드 ↔ 백엔드 연결 | 완료 | `feature/ranking-integration` | (2단계에 포함) |
| 4 | DB를 MySQL로 전환 | 완료 | `feature/mysql-profile` | 1일 |
| 5 | AWS EC2 배포 | 완료 (https://jijunwon-tetris.duckdns.org) | `chore/depoly-ec2` | 1~3일 |
| 6 | CI/CD 자동 배포 (선택) | 완료 | `ci/github-actions` | 선택 |

- 단계를 끝내면 위 표의 상태를 바꾸고, 그날 한 일은 `docs/Update.md`, 바로 다음 할 일은 `docs/TODO.md`에 적는다.

## 확정된 결정 사항

- 프론트엔드는 처음 계획(HTML + canvas + 순수 JS) 대신 **React + Vite**로 구현했다 (`front_end/`).
- 계정 생성은 **닉네임 + 아이디 + 비밀번호**를 받는다. 랭킹에 닉네임만 보이므로 아이디와 닉네임 모두 중복을 막는다 (`feature/gameplay`에서 닉네임 추가, `feature/nickname-ranking`에서 닉네임 중복 금지).
- 회원가입은 프론트엔드만으로 만들지 않고, **Spring Boot 백엔드를 먼저 만든 뒤** 구현한다.
  - 이유: 브라우저(`localStorage`)에 저장하면 비밀번호가 노출되고, 랭킹이 브라우저마다 따로 쌓인다.
- 비밀번호는 서버에서 **BCrypt로 해시**해서 저장한다.
- 로그인해야 게임을 할 수 있고, 랭킹과 플레이어 카드에는 **닉네임**이 표시된다 (닉네임이 없는 예전 계정은 아이디).
- 로그인은 **세션(쿠키)** 으로 유지한다. 배포할 때는 프론트를 Spring Boot가 같은 주소에서 서빙하고, 개발할 때는 Vite 프록시로 `/api`를 백엔드에 넘겨서 쿠키가 그대로 전달된다.
- 랭킹은 서버 API로 저장·조회한다 (`localStorage` 랭킹은 제거).
- 프론트 빌드 결과는 소스 폴더에 복사하지 않고, `bootJar`가 `front_end/dist`를 JAR 안의 `static/`에 넣는다.

---

## 0단계: 개발 환경 준비

- [x] JDK 설치 (현재 PC: OpenJDK 25 / Spring Boot 3.x는 17 이상 필요)
- [x] IDE: Cursor (+ Java 확장) 또는 IntelliJ IDEA Community
- [x] Git / GitHub 계정 (배포와 CI/CD에 사용)
- [x] AWS 계정 생성 → 가입 직후 Billing → Budget 알림(예: $5) 설정

## 1단계: 테트리스 게임 구현 (프론트엔드) — 완료

백엔드 없이 브라우저에서만 동작하는 버전.

- [x] 게임판: 가로 10 × 세로 20 2차원 배열
- [x] 블록 7종 (I, O, T, S, Z, J, L): 모양과 색 정의
- [x] 게임 루프: `requestAnimationFrame`으로 일정 간격마다 한 칸씩 내리기
- [x] 키 입력: ← → 이동, ↑ 회전, ↓ 소프트 드롭, Space 하드 드롭
- [x] 충돌 판정: 벽, 바닥, 쌓인 블록과 겹치는지 검사
- [x] 고정과 줄 삭제: 바닥에 닿으면 고정, 꽉 찬 줄은 지우고 위 줄을 내림
- [x] 점수, 레벨, 속도: 지운 줄 수에 따라 점수, 레벨이 오르면 빨라짐
- [x] 게임 오버: 새 블록이 생성 위치에서 바로 충돌하면 종료
- [x] (선택) 다음 블록 미리보기, 홀드, 고스트 블록

## 2단계: Spring Boot 백엔드 만들기

### 2-1. 프로젝트 생성

- [x] start.spring.io에서 생성 → `back_end/`에 배치
  - Project: Gradle / Language: Java / Spring Boot: 3.x
  - Dependencies: Spring Web, Spring Data JPA, H2 Database, MySQL Driver, Lombok, Validation (+ 회원가입용 Spring Security)
- [x] 개발 중에는 H2 인메모리 DB 사용 (설치 불필요)

권장 폴더 구조:

```text
src/main/java/com/example/tetris/
├── controller/ScoreController.java   // REST API
├── service/ScoreService.java         // 비즈니스 로직
├── repository/ScoreRepository.java   // JPA
├── domain/Score.java                 // 엔티티 (id, 사용자, score, lines, createdAt)
└── dto/ScoreRequest.java, ScoreResponse.java
src/main/resources/
├── static/          // 프론트 빌드 결과(front_end/dist)를 여기에
└── application.properties (+ application-local / application-prod)
```

### 2-2. 랭킹 API

- [x] `POST /api/scores`: 게임이 끝나면 점수 저장
- [x] `GET /api/scores/top?limit=10`: 상위 랭킹 조회

### 2-3. 회원가입 / 로그인 API

- [x] 회원가입: 아이디 + 비밀번호, 비밀번호는 BCrypt 해시로 저장
- [x] 로그인 / 로그아웃
- [x] 점수 저장은 로그인한 사용자만 가능, 점수에 사용자 연결

확장 아이디어 (배포까지 한 번 성공한 뒤에): 개인 최고 기록, WebSocket 실시간 대전.

## 3단계: 프론트엔드와 백엔드 연결

- [x] 프론트 빌드 결과를 JAR의 `static/`에 넣어 Spring Boot 한 곳에서 게임과 API를 서빙 (같은 주소라 CORS 설정 불필요)
- [x] 로그인 / 회원가입 화면 추가, 로그인해야 게임 시작
- [x] 게임 오버 시 `fetch('/api/scores', { method: 'POST', ... })`로 점수 전송
- [x] 랭킹 창을 `GET /api/scores/top` 결과로 표시 (`localStorage` 랭킹, 닉네임 입력칸 제거)
- [x] `./gradlew build`로 `build/libs/*.jar` 생성 확인 → 이 JAR 하나가 배포 결과물

실행 방법:

- 개발: `back_end`에서 `.\gradlew bootRun`, `front_end`에서 `npm run dev` → `http://localhost:5173`
- 배포용 확인: `back_end`에서 `.\gradlew build` 후 `java -jar build\libs\tetris-0.0.1-SNAPSHOT.jar` → `http://localhost:8080`

## 4단계: DB를 MySQL로 전환

- [x] 설정을 프로필로 분리: `application-local.properties` = H2 (기본값), `application-prod.properties` = MySQL
- [x] DB 비밀번호는 코드에 쓰지 않고 환경변수로 (`${DB_PASSWORD}`)
- [x] 로컬 MySQL(이 PC의 MySQL 8.0)로 테스트 (서버를 껐다 켜도 계정과 랭킹 유지 확인)

실행 방법 (`prod`):

```powershell
$env:DB_PASSWORD="비밀번호"
.\gradlew bootRun --args='--spring.profiles.active=prod'
```

## 5단계: AWS에 배포

### 방법 A (추천, 처음이라면): EC2 한 대

- [x] EC2 인스턴스 생성: Ubuntu 24.04, 프리티어, 키페어(.pem) 다운로드, 스왑 2GB
- [x] 보안 그룹: 22(SSH, 내 IP만 허용), 80(HTTP) 열기
- [x] SSH 접속 후 Java 21 설치 (`sudo apt install openjdk-21-jre-headless`, 이 프로젝트는 21 이상 필요)
- [x] DB 준비: EC2에 MySQL 직접 설치, `tetris` DB와 사용자 생성
- [x] JAR 업로드: 내 PC에서 빌드한 JAR를 `scp`로 `/opt/tetris/app.jar`에 복사 (서버는 메모리가 작아 빌드하지 않음)
- [x] 실행: `java -jar /opt/tetris/app.jar --spring.profiles.active=prod`
- [x] systemd 서비스로 등록 (`/etc/systemd/system/tetris.service`, 비밀번호는 `/etc/tetris/tetris.env`)
- [x] Nginx 리버스 프록시: 80번 → 8080번 (`/etc/nginx/sites-available/tetris`)
- [x] 탄력적 IP(Elastic IP) 연결 (재부팅해도 IP 고정, 서버를 지울 때 함께 해제)
- [x] (선택) 도메인 + HTTPS: DuckDNS 무료 서브도메인 `jijunwon-tetris.duckdns.org`, Let's Encrypt(certbot)로 무료 HTTPS (자동 갱신, HTTP는 HTTPS로 리다이렉트)

### 방법 B (익숙해진 뒤에)

- Docker 이미지로 만들어 EC2에서 `docker compose`로 실행, 또는 Elastic Beanstalk 사용

## 6단계: 자동 배포 (CI/CD, 선택)

- [x] GitHub Actions: `main`에 push하면 빌드 → 테스트 → EC2로 JAR 전송 → 서비스 재시작 (`.github/workflows/deploy.yml`)
  - 다른 브랜치에 push하면 테스트와 빌드만 한다
  - SSH 22번은 배포하는 동안만 GitHub 서버 IP에 열고, 끝나면 닫는다 (IAM 사용자는 이 보안 그룹 규칙만 바꿀 수 있게 제한)
  - 배포 전용 SSH 키를 따로 쓰고, 직전 JAR는 `/opt/tetris/app.jar.bak`으로 남긴다
  - GitHub Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `EC2_SECURITY_GROUP_ID`, `EC2_HOST`, `EC2_SSH_KEY`
- 수동 배포를 한두 번 해본 다음에 붙이면 각 단계를 이해하기 쉽다.

---

## 주의할 점

- 각 단계가 끝날 때마다 Git에 커밋한다.
- AWS는 다 쓴 리소스(RDS, Elastic IP 등)를 꺼두지 않으면 요금이 나온다. 특히 EC2에 연결되지 않은 Elastic IP는 요금이 붙는다.
- `.pem` 키, DB 비밀번호, AWS 키는 절대 GitHub에 올리지 않는다.
