/**
 * 개선 전 기준 측정: 랭킹 조회만 부하를 건다.
 *
 * 사용:
 *   k6 run load-test/ranking-get.js
 *   k6 run -e BASE_URL=http://localhost:8080 -e VUS=50 -e DURATION=30s load-test/ranking-get.js
 *
 * 운영 서버에는 쏘지 않는다.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const VUS = Number(__ENV.VUS || 50);
const DURATION = __ENV.DURATION || '30s';
const RESULT_FILE =
  __ENV.RESULT_FILE || 'load-test/results/baseline-ranking.md';
const LABEL = __ENV.LABEL || 'baseline';

const errorRate = new Rate('ranking_errors');
const rankingDuration = new Trend('ranking_duration', true);

export const options = {
  scenarios: {
    ranking_get: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<500'],
    ranking_errors: ['rate<0.05'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/scores/top?limit=10`, {
    tags: { name: 'GET /api/scores/top' },
  });

  rankingDuration.add(res.timings.duration);

  const ok = check(res, {
    'status is 200': (r) => r.status === 200,
    'body is JSON array': (r) => {
      try {
        return Array.isArray(r.json());
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!ok);
  sleep(0.1);
}

export function handleSummary(data) {
  const http = data.metrics.http_req_duration;
  const failed = data.metrics.http_req_failed;
  const reqs = data.metrics.http_reqs;
  const ranking = data.metrics.ranking_duration;

  const lines = [
    `# k6 ${LABEL} — GET /api/scores/top`,
    '',
    `- 일시: ${new Date().toISOString()}`,
    `- BASE_URL: ${BASE_URL}`,
    `- VUs: ${VUS}, duration: ${DURATION}`,
    '',
    '| 지표 | 값 |',
    '| --- | --- |',
    `| 요청 수 | ${reqs?.values?.count ?? '-'} |`,
    `| 초당 처리 수 (req/s) | ${(reqs?.values?.rate ?? 0).toFixed(2)} |`,
    `| 응답 시간 avg (ms) | ${(http?.values?.avg ?? 0).toFixed(2)} |`,
    `| 응답 시간 p95 (ms) | ${(http?.values?.['p(95)'] ?? 0).toFixed(2)} |`,
    `| 응답 시간 max (ms) | ${(http?.values?.max ?? 0).toFixed(2)} |`,
    `| 오류율 | ${((failed?.values?.rate ?? 0) * 100).toFixed(2)}% |`,
    `| ranking_duration p95 (ms) | ${(ranking?.values?.['p(95)'] ?? 0).toFixed(2)} |`,
    '',
  ];

  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [RESULT_FILE]: lines.join('\n'),
  };
}

function textSummary(data, opts) {
  // k6 기본 요약은 콘솔에 이미 나오므로, handleSummary용 간단 요약만 남긴다.
  const reqs = data.metrics.http_reqs?.values?.rate ?? 0;
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'] ?? 0;
  const fail = (data.metrics.http_req_failed?.values?.rate ?? 0) * 100;
  return `\n=== baseline summary ===\nreq/s: ${reqs.toFixed(2)}\np95: ${p95.toFixed(2)} ms\nerror: ${fail.toFixed(2)}%\n`;
}
