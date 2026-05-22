import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import ReactGA from 'react-ga4';
import './index.css';
import App from './App.tsx';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { CartProvider } from '@/contexts/CartContext';
import { SiteContentProvider } from '@/contexts/SiteContentContext';

ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);

inject();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteContentProvider>
      <AuthProvider>
        <AuthModalProvider>
          <CartProvider>
            <App />
            <Toaster theme="dark" richColors position="top-right" />
          </CartProvider>
        </AuthModalProvider>
      </AuthProvider>
    </SiteContentProvider>
  </StrictMode>,
);
