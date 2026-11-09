export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없습니다.');
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? '요청을 처리하지 못했습니다.');
  }
  return data;
}

export function signup(username, password) {
  return request('/api/auth/signup', { method: 'POST', body: { username, password } });
}

export function login(username, password) {
  return request('/api/auth/login', { method: 'POST', body: { username, password } });
}

export function logout() {
  return request('/api/auth/logout', { method: 'POST' });
}

export async function fetchMe() {
  try {
    return await request('/api/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function saveScore(score, clearedLines) {
  return request('/api/scores', { method: 'POST', body: { score, clearedLines } });
}

export function fetchTopScores(limit = 5) {
  return request(`/api/scores/top?limit=${limit}`);
}
