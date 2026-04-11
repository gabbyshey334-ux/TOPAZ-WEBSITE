import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/admin';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white text-sm">
        Loading…
      </div>
    );
  }

  if (!user || !isAdminEmail(user.email)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
