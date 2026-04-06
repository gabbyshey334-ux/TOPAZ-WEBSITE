import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MembersLogin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { pendingApproval?: boolean } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pendingMsg = location.state?.pendingApproval;

  useEffect(() => {
    if (loading || !user || isAdminEmail(user.email)) return;
    (async () => {
      const { data } = await supabase.from('members').select('is_approved').eq('id', user.id).maybeSingle();
      if (data?.is_approved) navigate('/members/dashboard', { replace: true });
    })();
  }, [loading, user, navigate]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-600 text-center">
          Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.
        </p>
      </div>
    );
  }

  if (!loading && user && isAdminEmail(user.email)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (isAdminEmail(data.user?.email)) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    const { data: mem } = await supabase.from('members').select('is_approved').eq('id', data.user!.id).maybeSingle();
    if (!mem?.is_approved) {
      await supabase.auth.signOut();
      setErr('Your account is pending approval. Nick will approve studio members from the admin dashboard.');
      return;
    }
    navigate('/members/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-gray-900 flex flex-col items-center justify-center px-4 py-24">
      <Link
        to="/"
        className="mb-8 font-display font-black text-2xl text-white uppercase tracking-tight"
      >
        TOPAZ<span className="text-[#2E75B6]">2.0</span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Member login</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          For studio teachers and dancers with an approved account.
        </p>
        {pendingMsg ? (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-900 text-sm">
              Your account is pending approval. You cannot access member content until Nick approves your registration.
            </AlertDescription>
          </Alert>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mem-email">Email</Label>
            <Input
              id="mem-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mem-password">Password</Label>
            <Input
              id="mem-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <Button type="submit" disabled={busy} className="w-full bg-[#2E75B6] hover:bg-[#1F4E78]">
            {busy ? 'Signing in…' : 'Login'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Need an account?{' '}
          <Link to="/members/register" className="font-semibold text-[#2E75B6] hover:underline">
            Join
          </Link>
        </p>
      </div>
    </div>
  );
}
