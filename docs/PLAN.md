# PLAN

테트리스 게임(React) + Spring Boot 백엔드(회원가입, 랭킹)를 만들어 AWS EC2에 배포하는 프로젝트의 전체 로드맵.

## 진행 상황

| 단계 | 내용 | 상태 | 브랜치 | 예상 기간 |
| --- | --- | --- | --- | --- |
| 0 | 개발 환경 준비 | 진행 중 | - | - |
| 1 | 테트리스 (프론트엔드) | 완료 | `main` | 3~7일 |
| 2 | Spring Boot 백엔드 (랭킹 API, 회원가입/로그인) | 다음 작업 | `feature/backend-setup`, `feature/score-api` | 3~5일 (2~3단계 합산) |
| 3 | 프론트엔드 ↔ 백엔드 연결 | 대기 | `feature/ranking-integration` | (2단계에 포함) |
| 4 | DB를 MySQL로 전환 | 대기 | `feature/mysql-profile` | 1일 |
| 5 | AWS EC2 배포 | 대기 | `chore/depoly-ec2` | 1~3일 |
| 6 | CI/CD 자동 배포 (선택) | 대기 | `ci/github-actions` | 선택 |

- 단계를 끝내면 위 표의 상태를 바꾸고, 그날 한 일은 `docs/Update.md`, 바로 다음 할 일은 `docs/TODO.md`에 적는다.

## 확정된 결정 사항

- 프론트엔드는 처음 계획(HTML + canvas + 순수 JS) 대신 **React + Vite**로 구현했다 (`front_end/`).
- 회원가입은 **아이디 + 비밀번호만** 받는다.
- 회원가입은 프론트엔드만으로 만들지 않고, **Spring Boot 백엔드를 먼저 만든 뒤** 구현한다.
  - 이유: 브라우저(`localStorage`)에 저장하면 비밀번호가 노출되고, 랭킹이 브라우저마다 따로 쌓인다.
- 비밀번호는 서버에서 **BCrypt로 해시**해서 저장한다.
- 로그인해야 게임을 할 수 있고, 랭킹에는 닉네임 대신 **로그인한 아이디**가 표시된다.
- 현재 랭킹(등수 · 닉네임 · 점수)은 임시로 `localStorage`에 저장 중이며, 3단계에서 서버 API로 교체한다.

## 아직 정하지 않은 것

- 로그인 유지 방식: 세션(쿠키) vs JWT
  - 프론트를 Spring Boot가 같은 주소에서 서빙하면 세션 방식이 더 간단하다.

---

## 0단계: 개발 환경 준비

- [x] JDK 설치 (현재 PC: OpenJDK 25 / Spring Boot 3.x는 17 이상 필요)
- [x] IDE: Cursor (+ Java 확장) 또는 IntelliJ IDEA Community
- [x] Git / GitHub 계정 (배포와 CI/CD에 사용)
- [ ] AWS 계정 생성 → 가입 직후 Billing → Budget 알림(예: $5) 설정

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

- [ ] start.spring.io에서 생성 → `back_end/`에 배치
  - Project: Gradle / Language: Java / Spring Boot: 3.x
  - Dependencies: Spring Web, Spring Data JPA, H2 Database, MySQL Driver, Lombok, Validation (+ 회원가입용 Spring Security)
- [ ] 개발 중에는 H2 인메모리 DB 사용 (설치 불필요)

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
└── application.yml
```

### 2-2. 랭킹 API

- [ ] `POST /api/scores`: 게임이 끝나면 점수 저장
- [ ] `GET /api/scores/top?limit=10`: 상위 랭킹 조회

### 2-3. 회원가입 / 로그인 API

- [ ] 회원가입: 아이디 + 비밀번호, 비밀번호는 BCrypt 해시로 저장
- [ ] 로그인 / 로그아웃
- [ ] 점수 저장은 로그인한 사용자만 가능, 점수에 사용자 연결

확장 아이디어 (배포까지 한 번 성공한 뒤에): 개인 최고 기록, WebSocket 실시간 대전.

## 3단계: 프론트엔드와 백엔드 연결

- [ ] 프론트 빌드 결과(`front_end/dist`)를 `src/main/resources/static/`에 넣어 `http://localhost:8080`에서 게임 서빙 (같은 주소라 CORS 설정 불필요)
- [ ] 로그인 / 회원가입 화면 추가, 로그인해야 게임 시작
- [ ] 게임 오버 시 `fetch('/api/scores', { method: 'POST', ... })`로 점수 전송
- [ ] 랭킹 창을 `GET /api/scores/top` 결과로 표시 (`localStorage` 랭킹, 닉네임 입력칸 제거)
- [ ] `./gradlew build`로 `build/libs/*.jar` 생성 확인 → 이 JAR 하나가 배포 결과물

## 4단계: DB를 MySQL로 전환

- [ ] `application.yml`을 프로필로 분리: `local` = H2, `prod` = MySQL
- [ ] DB 비밀번호는 코드에 쓰지 않고 환경변수로 (`${DB_PASSWORD}`)
- [ ] 로컬 MySQL(또는 Docker MySQL)로 테스트

## 5단계: AWS에 배포

### 방법 A (추천, 처음이라면): EC2 한 대

- [ ] EC2 인스턴스 생성: Ubuntu, t2.micro 또는 t3.micro(프리티어), 키페어(.pem) 다운로드
- [ ] 보안 그룹: 22(SSH, 내 IP만 허용), 80/443(HTTP/HTTPS) 열기
- [ ] SSH 접속 후 JDK 설치 (`sudo apt install openjdk-17-jdk` 등)
- [ ] DB 준비: RDS MySQL 프리티어, 또는 비용 절감을 위해 EC2에 MySQL 직접 설치
- [ ] JAR 업로드: `scp`로 복사하거나 서버에서 `git clone` 후 빌드
- [ ] 실행: `java -jar -Dspring.profiles.active=prod app.jar`
- [ ] systemd 서비스로 등록 (터미널을 닫아도 계속 실행)
- [ ] Nginx 리버스 프록시: 80번 → 8080번
- [ ] 탄력적 IP(Elastic IP) 연결 (재부팅해도 IP 고정)
- [ ] (선택) 도메인 + HTTPS: Route 53이나 가비아에서 도메인 연결, Let's Encrypt(certbot)로 무료 HTTPS

### 방법 B (익숙해진 뒤에)

- Docker 이미지로 만들어 EC2에서 `docker compose`로 실행, 또는 Elastic Beanstalk 사용

## 6단계: 자동 배포 (CI/CD, 선택)

- [ ] GitHub Actions: `main`에 push하면 빌드 → 테스트 → EC2로 JAR 전송 → 서비스 재시작
- 수동 배포를 한두 번 해본 다음에 붙이면 각 단계를 이해하기 쉽다.

---

## 주의할 점

- 각 단계가 끝날 때마다 Git에 커밋한다.
- AWS는 다 쓴 리소스(RDS, Elastic IP 등)를 꺼두지 않으면 요금이 나온다. 특히 EC2에 연결되지 않은 Elastic IP는 요금이 붙는다.
- `.pem` 키, DB 비밀번호, AWS 키는 절대 GitHub에 올리지 않는다.
