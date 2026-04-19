import { useState, type FormEvent } from 'react';
import { Mail, CheckCircle2, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error';

const MailingListSection = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const isSuccess = status === 'success' || status === 'duplicate';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const { error } = await supabase
      .from('mailing_list')
      .insert({
        email: trimmedEmail,
        name: trimmedName || null,
        source: 'homepage',
      });

    if (error) {
      const code = (error as { code?: string }).code;
      const message = (error.message || '').toLowerCase();
      if (code === '23505' || message.includes('duplicate') || message.includes('unique')) {
        setStatus('duplicate');
        return;
      }
      console.error('[mailing_list] insert failed', error);
      setStatus('error');
      return;
    }

    setStatus('success');

    // Fire-and-forget welcome email
    void supabase.functions
      .invoke('send-welcome-email', {
        body: { to: trimmedEmail, name: trimmedName || null },
      })
      .catch((err) => {
        console.warn('[send-welcome-email] non-blocking failure', err);
      });
  };

  return (
    <section
      id="mailing-list"
      className="relative bg-gradient-to-br from-white via-[#f3f8fc] to-[#e6f0fa] py-24 lg:py-32 overflow-hidden scroll-mt-24"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#2E75B6]/10 rounded-full blur-[120px]" aria-hidden />
      <div className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] bg-[#1F4E78]/10 rounded-full blur-[140px]" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #1F4E78 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
        aria-hidden
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-[#2E75B6]/15 shadow-[0_20px_60px_-20px_rgba(31,78,120,0.35)] overflow-hidden">
          {/* Accent bar */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#1F4E78] via-[#2E75B6] to-[#7EB8E8]" />

          <div className="px-6 sm:px-10 lg:px-14 py-14 sm:py-16">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E75B6]/10 border border-[#2E75B6]/20 font-mono text-[#1F4E78] text-xs tracking-[0.22em] uppercase font-bold mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                Newsletter
              </span>
              <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-[#0F2847] tracking-tight leading-[0.95]">
                STAY IN THE <span className="italic text-[#2E75B6]">LOOP</span>
              </h2>
              <p className="mt-5 text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Be the first to know about competitions, registration openings, and TOPAZ 2.0 news.
              </p>
            </div>

            {isSuccess ? (
              <div className="max-w-md mx-auto text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#0F2847] mb-2">
                  {status === 'duplicate' ? "You're already in!" : "You're on the list!"}
                </h3>
                <p className="text-slate-600">
                  {status === 'duplicate'
                    ? "You're already subscribed! We'll keep you posted."
                    : "We'll keep you updated."}
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="max-w-xl mx-auto space-y-4"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name (optional)"
                      autoComplete="name"
                      disabled={status === 'loading'}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-300 bg-white text-[#0F2847] placeholder:text-slate-400 focus:outline-none focus:border-[#2E75B6] focus:ring-4 focus:ring-[#2E75B6]/15 transition-all disabled:opacity-60"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                      disabled={status === 'loading'}
                      className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-300 bg-white text-[#0F2847] placeholder:text-slate-400 focus:outline-none focus:border-[#2E75B6] focus:ring-4 focus:ring-[#2E75B6]/15 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group w-full h-14 rounded-2xl bg-[#1F4E78] hover:bg-[#0F2847] text-white font-bold text-sm uppercase tracking-[0.2em] inline-flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-[#1F4E78]/25 hover:shadow-xl hover:shadow-[#1F4E78]/35 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      Joining…
                    </>
                  ) : (
                    <>
                      Join the List
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>Something went wrong. Please try again.</span>
                  </div>
                )}

                <p className="text-center text-xs text-slate-500 pt-2">
                  No spam. Unsubscribe anytime. We'll only email you with TOPAZ 2.0 news.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MailingListSection;
