import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthModalProvider>
        <App />
      </AuthModalProvider>
    </AuthProvider>
  </StrictMode>,
);
