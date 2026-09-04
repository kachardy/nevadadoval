import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';       // CSS do Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css';   // Ícones do Bootstrap
import './index.css';                                // Seu CSS customizado (cores da Nevada)
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);