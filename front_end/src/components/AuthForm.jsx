import { useState } from 'react';

const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MAX_LENGTH = 72;

const MODES = {
  login: { title: '로그인', submit: '로그인', switchText: '계정이 없나요?', switchTo: 'signup', switchLabel: '회원가입' },
  signup: { title: '회원가입', submit: '가입하기', switchText: '이미 계정이 있나요?', switchTo: 'login', switchLabel: '로그인' },
};

export default function AuthForm({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const text = MODES[mode];
  const trimmed = username.trim();
  const canSubmit = Boolean(trimmed && password) && !pending;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    setError('');
    try {
      await (mode === 'login' ? onLogin : onSignup)(trimmed, password);
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
        <input
          className="auth-form__input"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          maxLength={USERNAME_MAX_LENGTH}
          placeholder="아이디"
          aria-label="아이디"
          autoComplete="username"
          autoFocus
        />
        <input
          className="auth-form__input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder="비밀번호"
          aria-label="비밀번호"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
