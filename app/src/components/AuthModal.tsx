import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal, type AuthModalTab } from '@/contexts/AuthModalContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AuthModal() {
  const { isOpen, tab: contextTab, closeAuthModal, openAuthModal } = useAuthModal();
  const { user, signIn, signUp, resetPassword } = useAuth();

  const [tab, setTab] = useState<AuthModalTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerDone, setRegisterDone] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(contextTab);
      setError(null);
      setRegisterDone(false);
      setForgotDone(false);
    }
  }, [isOpen, contextTab]);

  useEffect(() => {
    if (user && isOpen) closeAuthModal();
  }, [user, isOpen, closeAuthModal]);

  if (!isOpen) return null;

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err.message);
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email.trim(), password, {
      full_name: fullName.trim(),
      studio_name: studioName.trim(),
    });
    if (err) {
      setLoading(false);
      setError(err.message);
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const u = sessionData.session?.user ?? null;
    if (u) {
      await supabase.from('members').upsert(
        {
          id: u.id,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          studio_name: studioName.trim(),
          is_approved: false,
        },
        { onConflict: 'id' }
      );
    }
    setLoading(false);
    setRegisterDone(true);
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    const { error: err } = await resetPassword(email.trim());
    setLoading(false);
    if (err) setError(err.message);
    else setForgotDone(true);
  }

  return (
    <div
      className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="glass-dark border border-white/10 rounded-[2rem] p-8 lg:p-10 max-w-md w-full relative overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-6 right-6 z-10">
          <button
            type="button"
            onClick={closeAuthModal}
            className="w-10 h-10 rounded-full glass border-none flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
          {(['login', 'register', 'forgot'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError(null);
                setRegisterDone(false);
                setForgotDone(false);
              }}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                tab === t ? 'bg-[#2E75B6] text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {t === 'login' ? 'Login' : t === 'register' ? 'Register' : 'Forgot'}
            </button>
          ))}
        </div>

        {tab === 'login' && (
          <form onSubmit={onLogin} className="space-y-4">
            <h2 id="auth-modal-title" className="font-display font-black text-2xl text-white uppercase tracking-tight mb-2">
              Sign in
            </h2>
            <div>
              <Label className="text-white/80">Email</Label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white/5 border-white/20 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-white/80">Password</Label>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-white/5 border-white/20 text-white"
                required
              />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <Button type="submit" disabled={loading} className="w-full bg-[#2E75B6] hover:bg-[#1F4E78]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
            </Button>
            <button
              type="button"
              className="text-sm text-[#2E75B6] hover:underline w-full text-left"
              onClick={() => setTab('forgot')}
            >
              Forgot password?
            </button>
          </form>
        )}

        {tab === 'register' && (
          <div>
            {registerDone ? (
              <p className="text-white/90 text-center py-4">Account created! Pending admin approval.</p>
            ) : (
              <form onSubmit={onRegister} className="space-y-4">
                <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mb-2">
                  Create account
                </h2>
                <div>
                  <Label className="text-white/80">Full name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Studio name</Label>
                  <Input
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Confirm password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <Button type="submit" disabled={loading} className="w-full bg-[#2E75B6] hover:bg-[#1F4E78]">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register'}
                </Button>
              </form>
            )}
          </div>
        )}

        {tab === 'forgot' && (
          <form onSubmit={onForgot} className="space-y-4">
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mb-2">
              Reset password
            </h2>
            <div>
              <Label className="text-white/80">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white/5 border-white/20 text-white"
                required
              />
            </div>
            {forgotDone ? <p className="text-white/90 text-sm">Check your email for a reset link.</p> : null}
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <Button type="submit" disabled={loading} className="w-full bg-[#2E75B6] hover:bg-[#1F4E78]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
            </Button>
            <button
              type="button"
              className="text-sm text-[#2E75B6] hover:underline"
              onClick={() => openAuthModal('login')}
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
