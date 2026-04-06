import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/admin';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function ProtectedMemberDashboard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [memberLoading, setMemberLoading] = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      setMemberLoading(false);
      setApproved(false);
      return;
    }

    if (isAdminEmail(user.email)) {
      setMemberLoading(false);
      setApproved(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('members').select('is_approved').eq('id', user.id).maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setApproved(false);
      } else {
        setApproved(data.is_approved === true);
      }
      setMemberLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!isSupabaseConfigured) {
    return <Navigate to="/members/login" replace state={{ from: location }} />;
  }

  if (loading || memberLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-700">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/members/login" replace state={{ from: location }} />;
  }

  if (isAdminEmail(user.email)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!approved) {
    return (
      <Navigate
        to="/members/login"
        replace
        state={{ pendingApproval: true, from: location }}
      />
    );
  }

  return <>{children}</>;
}
