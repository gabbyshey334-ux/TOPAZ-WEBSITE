import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  title: string;
  updated: string;
  children: ReactNode;
};

/**
 * Shared shell for Privacy Policy / Terms of Service — readable document layout
 * on the public dark background.
 */
export default function LegalDocumentPage({ title, updated, children }: Props) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | Topaz 2.0 - Dance Competition`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#7EB8E8]">
          Legal
        </p>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-white/50">Last updated: {updated}</p>

        <article className="mt-10 space-y-8 rounded-3xl border border-white/10 bg-white px-6 py-10 text-gray-700 shadow-2xl sm:px-10 sm:py-12">
          {children}
        </article>

        <p className="mt-8 text-center text-sm text-white/50">
          Questions?{' '}
          <Link to="/contact" className="text-[#7EB8E8] hover:text-white transition-colors">
            Contact us
          </Link>
          {' · '}
          <a
            href="mailto:topaz2.0@yahoo.com"
            className="text-[#7EB8E8] hover:text-white transition-colors break-all"
          >
            topaz2.0@yahoo.com
          </a>
        </p>
      </div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-black text-gray-900 tracking-tight">{title}</h2>
      <div className="space-y-3 text-base leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}
