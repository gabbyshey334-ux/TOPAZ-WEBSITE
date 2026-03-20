import { X, Facebook, Loader2 } from 'lucide-react';
import { useState } from 'react';

export interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignUpModal = ({ isOpen, onClose }: SignUpModalProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignUp = (method: string) => {
    setLoading(method);
    setTimeout(() => {
      alert('Feature coming soon! Registration will be available when the site officially launches.');
      setLoading(null);
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-500"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
    >
      <div
        className="glass-dark border border-white/10 rounded-[3rem] p-10 lg:p-16 max-w-xl w-full relative overflow-hidden animate-in zoom-in duration-500 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background visual decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full glass border-none flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="font-mono text-primary font-bold text-xs tracking-[0.4em] uppercase mb-4">Official Access</p>
            <h2 id="signup-modal-title" className="text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-tighter leading-none mb-6">
              JOIN THE <br />
              <span className="text-primary italic underline decoration-primary/20 decoration-4">DANCE.</span>
            </h2>
            <p className="text-white/40 text-lg font-medium">
              Experience the next generation of <br />performing arts competition.
            </p>
          </div>

          {/* Social buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={() => handleSignUp('Google')}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-white text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading === 'Google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Connect with Google
                </>
              )}
            </button>

            <button
              onClick={() => handleSignUp('Facebook')}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-[#1877F2] text-white font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-[#166FE5] transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading === 'Facebook' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Facebook className="w-5 h-5 fill-current" />
                  Connect with Facebook
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-6 my-10">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 font-mono text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email button */}
          <button
            onClick={() => handleSignUp('email')}
            disabled={!!loading}
            className="w-full px-8 py-5 border-2 border-white/10 text-white font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            {loading === 'email' ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Sign up with email'
            )}
          </button>

          {/* Footer text */}
          <div className="mt-12 text-center space-y-4">
            <p className="text-white/30 text-xs font-medium leading-relaxed">
              By joining, you agree to our <span className="text-white hover:underline cursor-pointer">Terms of Service</span> and <br />
              <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
            <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">
              Already a member? <button onClick={() => handleSignUp('login')} className="text-primary hover:text-secondary transition-colors underline underline-offset-4">Log In</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
