import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MembersLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 text-white text-center">
        <p>Supabase is not configured.</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    if (err) {
      setError(err.message || 'Login failed.');
      setSubmitting(false);
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const u = session?.user;
    if (isAdminEmail(u?.email)) {
      await supabase.auth.signOut();
      setError('Please use the admin login page for staff accounts.');
      setSubmitting(false);
      return;
    }
    if (!u?.id) {
      setError('Session could not be established.');
      setSubmitting(false);
      return;
    }
    const { data: member } = await supabase.from('members').select('*').eq('id', u.id).maybeSingle();
    if (!member) {
      await supabase.auth.signOut();
      setError('No member profile found. Please register first.');
      setSubmitting(false);
      return;
    }
    if (!member.is_approved) {
      await supabase.auth.signOut();
      setError('Your account is pending approval by the administrator.');
      setSubmitting(false);
      return;
    }
    navigate('/members/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="font-display font-black text-2xl text-white uppercase">
            TOPAZ<span className="text-[#2E75B6]">2.0</span>
          </Link>
          <h1 className="mt-6 text-xl font-bold text-white tracking-wide">Member login</h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6 backdrop-blur-sm"
        >
          {error ? (
            <Alert variant="destructive" className="bg-red-950/80 border-red-800 text-red-100">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="mem-email" className="text-white/80">
              Email
            </Label>
            <Input
              id="mem-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/40 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mem-password" className="text-white/80">
              Password
            </Label>
            <Input
              id="mem-password"
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
            {submitting ? 'Signing in…' : 'Log in'}
          </Button>
        </form>

        <p className="text-center text-sm text-white/50">
          Need an account?{' '}
          <Link to="/members/register" className="text-[#7EB8E8] hover:underline">
            Join
          </Link>
        </p>
        <p className="text-center text-sm text-white/40">
          <Link to="/" className="hover:text-white/70">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
