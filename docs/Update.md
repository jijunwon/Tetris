## 2026-11-04

### 프로젝트 준비
- 로드맵 정리 (`docs/TODO.md`), 단계별 브랜치 생성

#### 프론트엔드 테트리스 구현 (React + Vite)
- 블록 이동·회전·드롭, 줄 삭제, 점수·레벨, 게임 오버
- 홀드, 다음 블록 미리보기, 고스트 블록
- 게임 로직 단위 테스트 (Vitest)

## 2026-11-06

### Spring 준비
- Spring boot 설치 및 연결확인
- hello tetris


## 2026-11-07

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


## 2026-11-09

### 프론트엔드 / 백엔드 연결
- Vite 프록시로 `/api` 요청을 백엔드(8080)로 전달
- `api.js`: 회원가입·로그인·로그아웃·내 정보·점수 저장·랭킹 조회 함수
- 로그인 / 회원가입 폼 추가, 로그인해야 게임 시작, 로그아웃하면 게임 초기화
- 게임 오버 시 점수를 서버에 자동 저장, 랭킹은 서버에서 조회해 아이디로 표시
- `localStorage` 랭킹과 닉네임 입력칸 제거

### 배포 준비
- `bootJar`가 프론트를 빌드해 JAR 안의 `static/`에 넣도록 설정
- 로그인 검사를 `/api/**`에만 적용해서 게임 페이지가 막히지 않게 수정
- `.\gradlew build`로 만든 JAR 하나로 게임과 API가 함께 열리는 것을 확인


## 2026-11-10

### MySQL 전환
- 설정을 `local`(H2, 기본값) / `prod`(MySQL) 프로필로 분리, MySQL 드라이버 추가
- DB 비밀번호는 환경변수 `DB_PASSWORD`로만 받음
- 로컬 MySQL 8.0에서 서버를 껐다 켜도 계정과 랭킹이 유지되는 것을 확인
- 실패하던 줄 삭제 점수 테스트 2개 수정
- `feature/ranking-integration`, `feature/mysql-profile`을 `main`에 머지하고 푸시

### AWS EC2 배포
- EC2 인스턴스 생성 (Ubuntu 24.04, 키페어, SSH는 내 IP만 / HTTP 허용)
- 서버에 스왑 2GB, Java 21, MySQL 설치, `tetris` DB와 사용자 생성
- 내 PC에서 빌드한 JAR를 `scp`로 `/opt/tetris/app.jar`에 복사
- 서버에서 `prod` 프로필로 실행해 MySQL 연결과 `Started TetrisApplication` 확인
- `systemd` 서비스로 등록 (비밀번호는 root만 읽는 `/etc/tetris/tetris.env`)
- Nginx로 80번 → 8080번 연결, 브라우저에서 `http://서버IP`로 게임 접속 확인
- 탄력적 IP를 연결해 서버 주소 고정
- DuckDNS 무료 도메인 연결, 보안 그룹에 443 추가, certbot으로 HTTPS 적용
- https://jijunwon-tetris.duckdns.org 에서 게임 접속 확인

### CI/CD (GitHub Actions)
- push하면 프론트·백엔드 테스트와 JAR 빌드, `main`이면 EC2에 자동 배포
- 배포하는 동안만 GitHub 서버 IP에 SSH를 열고 끝나면 닫음 (IAM 사용자는 이 보안 그룹만 수정 가능)
- 배포 전용 SSH 키 분리, GitHub Secrets 6개 등록
- 첫 배포는 IAM 권한 오류(`UnauthorizedOperation`)로 실패, 보안 그룹 ID Secret과 정책을 맞춘 뒤 재실행해서 성공
