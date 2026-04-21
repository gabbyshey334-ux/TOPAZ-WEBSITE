import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Stable, permanent redirect route for the TOPAZ 2.0 registration form PDF.
 *
 * Hitting /registration-form immediately triggers a browser download of the
 * PDF stored in the Supabase `gallery-media` bucket at
 * `documents/registration-form.pdf`. This gives partners (studios, instructors)
 * a permanent URL like https://<site>/registration-form that won't break when
 * custom domains or hosting change, because the redirect target is always
 * resolved at runtime from the configured Supabase project.
 */
export default function RegistrationFormRedirect() {
  const [failed, setFailed] = useState(false);

  const pdfUrl = useMemo(() => {
    const { data } = supabase.storage
      .from('gallery-media')
      .getPublicUrl('documents/registration-form.pdf', {
        download: 'TOPAZ-Registration-Form.pdf',
      });
    return data?.publicUrl ?? '';
  }, []);

  useEffect(() => {
    if (!pdfUrl) {
      setFailed(true);
      return;
    }
    // Fire the download as soon as the route mounts. We use an anchor so the
    // response's Content-Disposition: attachment header from Supabase cleanly
    // triggers a download without fully navigating away from the SPA.
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.rel = 'noopener noreferrer';
    a.download = 'TOPAZ-Registration-Form.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // As a safety net in case the browser blocks the synthetic click (rare,
    // e.g. some in-app browsers), also navigate the tab to the PDF URL after
    // a brief delay. Supabase returns Content-Disposition: attachment, so
    // browsers will download rather than navigate; but if that fails the
    // visible fallback link below is always available.
    const t = window.setTimeout(() => {
      try {
        window.location.replace(pdfUrl);
      } catch {
        setFailed(true);
      }
    }, 400);

    return () => window.clearTimeout(t);
  }, [pdfUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-20">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#2E75B6]/10 flex items-center justify-center">
          <FileText className="w-8 h-8 text-[#2E75B6]" />
        </div>
        <h1 className="font-display font-black text-2xl text-[#0a0a0a] uppercase tracking-tight mb-3">
          TOPAZ 2.0 Registration Form
        </h1>
        {failed ? (
          <>
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-left mb-6">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium leading-relaxed">
                We couldn't start the download automatically. Use the button
                below, or contact topaz2.0@yahoo.com for help.
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Your download should begin automatically. If it doesn't, use the
            button below.
          </p>
        )}

        <a
          href={pdfUrl || '#'}
          download="TOPAZ-Registration-Form.pdf"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 bg-[#2E75B6] text-white font-bold rounded-full hover:bg-[#1F4E78] transition-all duration-300 uppercase tracking-widest text-sm shadow-lg"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </a>

        <Link
          to="/registration"
          className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0a0a0a] uppercase tracking-widest transition-colors"
        >
          Register online instead
        </Link>
      </div>
    </div>
  );
}
