# 랭킹 조회 부하 전후 비교 (로컬)

조건: `GET /api/scores/top?limit=10`, 50 VU, 30초, `http://localhost:8080`

| 지표 | 개선 전 (baseline) | 캐시 후 (after-cache) |
| --- | --- | --- |
| 초당 처리 수 (req/s) | 393.39 | 471.70 |
| 응답 시간 p95 (ms) | 30.58 | 8.20 |
| 오류율 | 0.00% | 0.00% |

- 개선 내용: Spring Cache + Caffeine (`topScores`), 점수 저장 시 `@CacheEvict`
- Nginx gzip·rate limit은 로컬에 없어 이 표에는 포함되지 않음. EC2에 `deploy/nginx/` 적용 후 운영에서 별도 확인
