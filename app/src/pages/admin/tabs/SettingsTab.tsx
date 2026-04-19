import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield, BarChart3, ExternalLink } from 'lucide-react';

export default function SettingsTab() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Account and session management.</p>
      </div>

      {/* Account card */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1F4E78] flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[#7EB8E8]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Logged in as</p>
            <p className="text-sm text-[#7EB8E8] font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-2">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          Admin access · Full permissions
        </div>
      </div>

      {/* Site Analytics */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#2E75B6]/20 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-[#7EB8E8]" />
          </div>
          <div>
            <h3 className="font-bold text-white">View Site Analytics</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Real-time visitor dashboard with page views, unique visitors, and top pages.
            </p>
          </div>
        </div>
        <a
          href="https://vercel.com/nick-s-projects-6b88a97e/topaz-website/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#2E75B6] hover:bg-[#1F4E78] text-white font-bold px-4 py-2 text-sm transition-colors"
        >
          Open Analytics
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Sign out */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
        <h3 className="font-bold text-white mb-1">Sign Out</h3>
        <p className="text-sm text-slate-400 mb-4">
          You will be signed out and redirected to the login page.
        </p>
        <Button
          variant="outline"
          className="border-red-700 text-red-400 hover:bg-red-950/40 hover:text-red-300 hover:border-red-600"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              Signing out…
            </span>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
