import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/admin';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLogin() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isAdminEmail(user.email)) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 text-white text-center">
        <p>Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  if (user && isAdminEmail(user.email)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Login failed. Check your email and password.');
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const u = session?.user;
    if (!isAdminEmail(u?.email)) {
      await supabase.auth.signOut();
      setError('This account is not authorized for admin access.');
      return;
    }
    navigate('/admin/dashboard', { replace: true });
  }

  async function onForgotPassword() {
    setError(null);
    setResetMessage(null);
    const em = email.trim();
    if (!em) {
      setError('Enter your email above, then click Forgot password to receive a reset link.');
      return;
    }
    setResetting(true);
    const redirectTo = `${window.location.origin}/admin/login`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(em, { redirectTo });
    setResetting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setResetMessage('Check your inbox for a password reset link from Supabase. Open it, choose a new password, then sign in here.');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="font-display font-black text-2xl text-white uppercase">
            TOPAZ<span className="text-[#2E75B6]">2.0</span>
          </Link>
          <h1 className="mt-6 text-xl font-bold text-white tracking-wide">Admin login</h1>
          <p className="mt-2 text-sm text-white/50">
            Sign in with the staff email (<span className="text-white/70">topaz2.0@yahoo.com</span>) and your Supabase
            password. First-time setup: use Forgot password or set the password in Supabase → Authentication → Users.
          </p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6 backdrop-blur-sm">
          {error ? (
            <Alert variant="destructive" className="bg-red-950/80 border-red-800 text-red-100">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {resetMessage ? (
            <Alert className="bg-emerald-950/50 border-emerald-800 text-emerald-100">
              <AlertDescription>{resetMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-white/80">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/40 border-white/20 text-white"
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
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border-white/20 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#2E75B6] hover:bg-[#1F4E78] text-white font-bold"
          >
            {submitting ? 'Signing in…' : 'Login'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-[#7EB8E8] hover:text-white hover:bg-white/5 text-sm"
            disabled={resetting}
            onClick={onForgotPassword}
          >
            {resetting ? 'Sending reset email…' : 'Forgot password?'}
          </Button>
        </form>

        <p className="text-center text-sm text-white/40">
          <Link to="/" className="hover:text-white/70">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
