import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import './index.css';
import App from './App.tsx';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { CartProvider } from '@/contexts/CartContext';

inject();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthModalProvider>
        <CartProvider>
          <App />
          <Toaster theme="dark" richColors position="top-right" />
        </CartProvider>
      </AuthModalProvider>
    </AuthProvider>
  </StrictMode>,
);
