import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { applyTheme, loadTheme } from './theme.js';
import './index.css';

// 첫 화면부터 저장된 테마로 그려서 다크 → 라이트로 깜빡이지 않게 한다.
applyTheme(loadTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
