import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MembersRegister() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studioName, setStudioName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
    const { error: authErr, data } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), studio_name: studioName.trim() },
      },
    });
    if (authErr) {
      setError(authErr.message);
      setSubmitting(false);
      return;
    }
    const uid = data.user?.id;
    if (!uid) {
      setError('Could not create account. If email confirmation is required, check your inbox and try again after confirming.');
      setSubmitting(false);
      return;
    }
    const { error: memErr } = await supabase.from('members').insert({
      id: uid,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      studio_name: studioName.trim(),
      is_approved: false,
    });
    if (memErr) {
      setError(memErr.message);
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="font-display font-black text-2xl text-white uppercase">
            TOPAZ<span className="text-[#2E75B6]">2.0</span>
          </Link>
          <h1 className="mt-6 text-xl font-bold text-white tracking-wide">Join member area</h1>
        </div>

        {success ? (
          <Alert className="bg-emerald-950/50 border-emerald-800 text-emerald-100">
            <AlertDescription>
              Your account is pending approval. You will be notified once approved.
            </AlertDescription>
          </Alert>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-5 backdrop-blur-sm"
          >
            {error ? (
              <Alert variant="destructive" className="bg-red-950/80 border-red-800 text-red-100">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="reg-name" className="text-white/80">
                Full name
              </Label>
              <Input
                id="reg-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-black/40 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-white/80">
                Email
              </Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/40 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-studio" className="text-white/80">
                Studio name
              </Label>
              <Input
                id="reg-studio"
                required
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="bg-black/40 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-white/80">
                Password
              </Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
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
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link to="/members/login" className="text-[#7EB8E8] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
