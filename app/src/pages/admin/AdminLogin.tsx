import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLogin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 text-white text-center">
        <p>Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.</p>
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
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (!isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      setErr('This account is not authorized for admin access.');
      return;
    }
    navigate('/admin/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <Link
        to="/"
        className="mb-10 font-display font-black text-2xl text-white uppercase tracking-tight"
      >
        TOPAZ<span className="text-[#2E75B6]">2.0</span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-white text-center mb-6">Admin login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-white/80">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-white/80">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          {err ? <p className="text-sm text-red-400">{err}</p> : null}
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-[#2E75B6] hover:bg-[#1F4E78] text-white font-bold uppercase tracking-wider"
          >
            {busy ? 'Signing in…' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
