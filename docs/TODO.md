# TODO

- [x] `feature/gameplay`를 푸시하고 `main`에 머지한다 (머지하면 닉네임 칸이 운영 DB에 자동 추가된다)
- [ ] 라이트 모드에서 하드 드롭하면 게임판이 어두워진다는 버그: 아직 재현 못 함, 다시 보이면 스크린샷으로 확인
- [x] 닉네임 중복 막기: 계정 생성 시 같은 닉네임이면 409로 거절, `nickname` 칸에 unique 조건, 백엔드 테스트 추가, `PLAN.md` 결정 사항 수정 (새 브랜치에서)
- [x] 랭킹 1~3위 강조: 1위 금색, 2위 은색, 3위 동색, 1위 순위 숫자 자리에 작은 왕관 아이콘 (`Ranking.jsx`, 세 테마 모두 잘 보이는 색으로)

7단계 (트래픽 관리 · 실시간 랭킹, 자세한 내용은 `PLAN.md` 7단계)
- [x] 개선 전 기준 수치 남기기: k6로 랭킹 조회 부하 테스트 (로컬) — ~408 req/s, p95 ~18ms, 오류 0%
- [x] CloudWatch 경보: CPU 80% 이상, 상태 검사 실패 시 메일 (SNS `tetris-alerts`)
- [x] `feature/traffic`: Nginx gzip + 정적 파일 캐시 헤더 + rate limit(로그인·가입·점수 저장), 429 안내, 랭킹 캐시 (EC2에 `deploy/nginx/` 적용·reload 완료)
- [ ] `feature/realtime-ranking`: 탭 복귀 시 갱신 + SSE로 랭킹 실시간 반영
- [ ] 개선 후 같은 k6 테스트로 전후 비교표 작성

- [x] 문서 변경(`docs/`)을 커밋하고 `main`에 푸시한다 (푸시하면 자동 배포도 한 번 돈다)
- [x] 실습을 쉴 때는 EC2 인스턴스 중지 · 탄력적 IP 해제 (2026-11-21). 다시 켤 때 새 IP를 DuckDNS에 넣고, 끝낼 때는 인스턴스 삭제 + IAM 키 삭제
- [ ] 끝낼 때는 IAM 사용자 `github-actions-tetris`의 액세스 키도 삭제
