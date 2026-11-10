import { useState } from 'react';

const NICKNAME_MAX_LENGTH = 12;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MAX_LENGTH = 72;

const MODES = {
  login: {
    title: 'Welcome!',
    submit: '로그인',
    switchText: '계정이 없나요?',
    switchTo: 'signup',
    switchLabel: '계정 생성',
  },
  signup: {
    title: '계정 생성',
    submit: '계정 만들기',
    switchText: '이미 계정이 있나요?',
    switchTo: 'login',
    switchLabel: '로그인',
  },
};

export default function AuthForm({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const text = MODES[mode];
  const isSignup = mode === 'signup';
  const trimmedNickname = nickname.trim();
  const trimmed = username.trim();
  const canSubmit =
    Boolean(trimmed && password && (!isSignup || trimmedNickname)) && !pending;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    setError('');
    try {
      if (isSignup) {
        await onSignup(trimmedNickname, trimmed, password);
      } else {
        await onLogin(trimmed, password);
      }
    } catch (submitError) {
      setError(submitError.message);
      setPending(false);
    }
  };

  const switchMode = () => {
    setMode(text.switchTo);
    setError('');
  };

  return (
    <div className="overlay">
      <h2 className="overlay__title">{text.title}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {isSignup && (
          <input
            className="auth-form__input"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={NICKNAME_MAX_LENGTH}
            placeholder="닉네임"
            aria-label="닉네임"
            autoComplete="nickname"
            autoFocus
          />
        )}
        <input
          className="auth-form__input"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          maxLength={USERNAME_MAX_LENGTH}
          placeholder="아이디"
          aria-label="아이디"
          autoComplete="username"
          autoFocus={!isSignup}
        />
        <input
          className="auth-form__input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder="비밀번호"
          aria-label="비밀번호"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
        />
        {error && (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="overlay__button" disabled={!canSubmit}>
          {pending ? '처리 중…' : text.submit}
        </button>
      </form>
      <p className="overlay__hint">
        {text.switchText}{' '}
        <button type="button" className="link-button" onClick={switchMode}>
          {text.switchLabel}
        </button>
      </p>
    </div>
  );
}
