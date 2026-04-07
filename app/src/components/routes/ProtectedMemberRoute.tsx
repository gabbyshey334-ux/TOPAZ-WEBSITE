import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';

type MemberRow = Database['public']['Tables']['members']['Row'];

export default function ProtectedMemberRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const location = useLocation();
  const [member, setMember] = useState<MemberRow | null | undefined>(undefined);

  const loadMember = useCallback(async () => {
    if (!user) {
      setMember(null);
      return;
    }
    const { data } = await supabase.from('members').select('*').eq('id', user.id).maybeSingle();
    setMember(data != null ? (data as MemberRow) : null);
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) loadMember();
    if (!authLoading && !user) setMember(null);
  }, [authLoading, user, loadMember]);

  if (!isSupabaseConfigured) {
    return <Navigate to="/members/login" replace state={{ from: location }} />;
  }

  if (authLoading || (user && member === undefined)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/members/login" replace state={{ from: location }} />;
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center text-white">
        <p className="text-lg text-white/90 max-w-md">
          No member profile was found for this account. Please complete registration first.
        </p>
        <Button asChild className="mt-6 bg-[#2E75B6] hover:bg-[#1F4E78]">
          <Link to="/members/register">Register</Link>
        </Button>
      </div>
    );
  }

  if (!member.is_approved) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center text-white">
        <p className="text-lg text-white/90 max-w-lg">
          Your account is pending approval by the administrator.
        </p>
        <Button
          variant="outline"
          className="mt-8 border-white/30 text-white hover:bg-white/10"
          onClick={() => signOut().then(() => (window.location.href = '/'))}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
