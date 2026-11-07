# TODO

## 2026-11-04

0단계: 개발 환경 준비
JDK 17 또는 21 설치 (Spring Boot 3.x는 17 이상이 필요해요)
IDE: IntelliJ IDEA Community나 Cursor + Java 확장
Git / GitHub 계정 (배포와 CI/CD에 사용)
AWS 계정 생성. 가입하자마자 Billing → Budget 알림(예: $5)부터 설정해 두는 걸 강하게 추천해요.
1단계: 테트리스 게임 구현 (프론트엔드)
처음에는 백엔드 없이 브라우저에서만 돌아가게 만드세요. HTML + <canvas> + 순수 JavaScript만으로 충분해요.

구현 순서:

게임판: 가로 10 × 세로 20 2차원 배열을 만들고 canvas에 그리기
블록 7종 (I, O, T, S, Z, J, L): 모양 배열과 색 정의
게임 루프: requestAnimationFrame으로 일정 간격마다 블록을 한 칸씩 내리기
키 입력: ← → 이동, ↑ 회전, ↓ 빠르게 내리기, Space 바로 떨어뜨리기(하드 드롭)
충돌 판정: 벽, 바닥, 이미 쌓인 블록과 겹치는지 검사 (가장 중요한 함수예요)
고정과 줄 삭제: 블록이 바닥에 닿으면 판에 고정하고, 꽉 찬 줄은 지우고 위 줄을 내리기
점수, 레벨, 속도: 지운 줄 수에 따라 점수를 주고 레벨이 오르면 속도를 높이기
게임 오버: 새 블록이 생성 위치에서 바로 충돌하면 종료
(선택) 다음 블록 미리보기, 홀드, 고스트 블록
2단계: Spring Boot 백엔드 만들기
start.spring.io에서 프로젝트를 생성해요.

Project: Gradle, Language: Java, Spring Boot: 3.x
Dependencies: Spring Web, Spring Data JPA, H2 Database, MySQL Driver, Lombok, Validation
권장 폴더 구조:


src/main/java/com/example/tetris/
├── controller/ScoreController.java   // REST API
├── service/ScoreService.java         // 비즈니스 로직
├── repository/ScoreRepository.java   // JPA
├── domain/Score.java                 // 엔티티 (id, nickname, score, lines, createdAt)
└── dto/ScoreRequest.java, ScoreResponse.java
src/main/resources/
├── static/        // 1단계 테트리스 파일(index.html, tetris.js, style.css)을 여기에
└── application.yml
처음 만들 API는 두 개면 충분해요.

POST /api/scores: 게임이 끝나면 닉네임과 점수 저장
GET /api/scores/top?limit=10: 상위 랭킹 조회
개발할 때는 H2 인메모리 DB를 쓰면 설치할 게 없어서 편해요. 확장 아이디어로는 회원가입/로그인(Spring Security + JWT), 개인 최고 기록, WebSocket을 이용한 실시간 대전이 있어요. 다만 이런 기능은 배포까지 한 번 성공한 뒤에 추가하는 걸 추천해요.

3단계: 프론트엔드와 백엔드 연결
테트리스 파일을 src/main/resources/static/에 넣으면 http://localhost:8080에서 게임이 바로 열려요. 같은 서버에서 서빙되니까 CORS 설정도 필요 없어요.
게임 오버가 되면 fetch('/api/scores', { method: 'POST', ... })로 점수를 보내요.
화면 옆에 GET /api/scores/top 결과로 랭킹 보드를 표시해요.
./gradlew build로 build/libs/*.jar가 생성되는지 확인해요. 이 JAR 파일 하나가 배포할 결과물이에요.
4단계: DB를 MySQL로 전환
application.yml을 프로필로 나눠요: local은 H2, prod는 MySQL
DB 비밀번호는 코드에 쓰지 말고 환경변수로 넣으세요 (${DB_PASSWORD}). GitHub에 비밀번호를 올리지 않는 게 핵심이에요.
로컬에서 MySQL(또는 Docker MySQL)로 한 번 테스트해 보세요.
5단계: AWS에 배포
방법 A (추천, 처음이라면): EC2 한 대

EC2 인스턴스 생성: Ubuntu, t2.micro 또는 t3.micro(프리티어 대상), 키페어(.pem) 다운로드
보안 그룹: 22(SSH, 내 IP만 허용), 80/443(HTTP/HTTPS) 열기
SSH 접속 후 sudo apt install openjdk-17-jdk
DB 준비: RDS MySQL 프리티어를 쓰거나, 비용을 아끼려면 EC2에 MySQL을 직접 설치
JAR 업로드: scp로 복사하거나 서버에서 git clone 후 빌드
실행: java -jar -Dspring.profiles.active=prod app.jar
터미널을 닫아도 계속 돌아가도록 systemd 서비스로 등록하세요.
Nginx 리버스 프록시: 80번 포트로 들어온 요청을 8080으로 전달
탄력적 IP(Elastic IP) 연결: 재부팅해도 IP가 바뀌지 않게
(선택) 도메인 + HTTPS: Route 53이나 가비아 등에서 도메인을 연결하고, Let's Encrypt(certbot)로 무료 HTTPS 적용
방법 B (익숙해진 뒤에): Docker 이미지로 만들어 EC2에서 docker compose로 실행하거나, Elastic Beanstalk을 쓰는 방법이 있어요.

6단계: 자동 배포 (CI/CD, 선택)
GitHub Actions를 설정하면 main 브랜치에 push할 때 자동으로 빌드하고 테스트한 뒤, EC2로 JAR를 전송하고 서비스를 재시작해요. 수동 배포를 한두 번 해본 다음에 붙이면 각 단계가 무슨 일을 하는지 이해하기 쉬워요.

추천 진행 순서와 예상 기간 (초보 기준 대략)
단계	내용	기간
1
테트리스 (JS)
3~7일
2~3
Spring Boot API와 연동
3~5일
4
MySQL 전환
1일
5
EC2 배포
1~3일
6
CI/CD, 로그인 등 확장
선택
주의할 점

각 단계가 끝날 때마다 Git에 커밋하세요.
AWS는 다 쓴 리소스(RDS, Elastic IP 등)를 꺼두지 않으면 요금이 나와요. 특히 EC2에 연결되지 않은 Elastic IP는 요금이 붙어요.
.pem 키, DB 비밀번호, AWS 키는 절대 GitHub에 올리지 마세요.
원하시면 지금 바로 1단계부터 같이 시작할 수 있어요. 이 저장소에 Spring Boot 프로젝트 구조를 만들고, static/ 폴더에 기본 테트리스(이동, 회전, 줄 삭제, 점수)까지 구현해 드릴게요.



Agent
