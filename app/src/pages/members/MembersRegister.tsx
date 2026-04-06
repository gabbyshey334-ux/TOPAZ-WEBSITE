import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MembersRegister() {
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

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

  if (!loading && user && !isAdminEmail(user.email)) {
    return <Navigate to="/members/dashboard" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          studio_name: studioName.trim() || undefined,
        },
      },
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setOk(true);
  }

  if (ok) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-gray-900 flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-xl text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Check your email</h1>
          <p className="text-gray-600 text-sm mb-6">
            We sent a confirmation link if your project requires email verification. After you confirm, your account
            stays <strong>pending</strong> until Nick approves you in the admin dashboard.
          </p>
          <Button asChild className="bg-[#2E75B6] hover:bg-[#1F4E78]">
            <Link to="/members/login">Go to login</Link>
          </Button>
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Create member account</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Studio teachers and dancers — you will need approval before accessing member resources.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name">Full name *</Label>
            <Input
              id="reg-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-studio">Studio name (optional)</Label>
            <Input id="reg-studio" value={studioName} onChange={(e) => setStudioName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email *</Label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password *</Label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <Button type="submit" disabled={busy} className="w-full bg-[#2E75B6] hover:bg-[#1F4E78]">
            {busy ? 'Creating…' : 'Register'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already approved?{' '}
          <Link to="/members/login" className="font-semibold text-[#2E75B6] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
