# 부하 테스트 (k6)

운영 서버가 아니라 **로컬**에서만 돌린다.

## 준비

1. [k6 설치](https://grafana.com/docs/k6/latest/set-up/install-k6/) (Windows: `winget install GrafanaLabs.k6`)
2. 백엔드 실행 (프로젝트 루트에서):

```powershell
cd back_end
.\gradlew.bat bootRun
```

기본 프로필은 `local`(H2). API는 `http://localhost:8080`.

## 1) 개선 전 기준 — 랭킹 조회

```powershell
# 프로젝트 루트에서
k6 run load-test/ranking-get.js
```

환경변수로 바꿀 수 있다.

```powershell
k6 run -e BASE_URL=http://localhost:8080 -e VUS=50 -e DURATION=30s load-test/ranking-get.js
```

끝나면 `load-test/results/baseline-ranking.md`에 초당 처리 수, p95, 오류율이 저장된다.

## 2) 개선 후 비교

캐시·rate limit을 넣은 뒤 **같은 명령**을 다시 실행하고, 결과를 `load-test/results/after-ranking.md`로 옮기거나 파일 이름을 바꿔 남긴다.
