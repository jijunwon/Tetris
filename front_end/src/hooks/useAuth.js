import { useCallback, useEffect, useState } from 'react';
import * as api from '../api.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .fetchMe()
      .catch(() => null)
      .then((me) => {
        if (!active) return;
        setUser(me);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    setUser(await api.login(username, password));
  }, []);

  // 회원가입만으로는 세션이 생기지 않으므로 바로 로그인까지 한다
  const signup = useCallback(async (username, password) => {
    await api.signup(username, password);
    setUser(await api.login(username, password));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return { user, loading, login, signup, logout };
}
