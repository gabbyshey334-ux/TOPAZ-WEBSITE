import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type AuthModalTab = 'login' | 'register' | 'forgot';

type AuthModalContextValue = {
  isOpen: boolean;
  tab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthModalTab>('login');

  const openAuthModal = useCallback((nextTab: AuthModalTab = 'login') => {
    setTab(nextTab);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, tab, openAuthModal, closeAuthModal }),
    [isOpen, tab, openAuthModal, closeAuthModal]
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
