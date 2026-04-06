import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/admin';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function AdminEntry() {
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return <Navigate to="/admin/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  if (!user || !isAdminEmail(user.email)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
}
