import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type GalleryRow = Database['public']['Tables']['gallery_images']['Row'];
type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];

const BASE = import.meta.env.BASE_URL;
const REG_PDF = `${BASE}pdfs/topaz-registration-form.pdf`;
const RULES_PDF = `${BASE}pdfs/topaz-rules.pdf`;

export default function MembersDashboard() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState<string>('');
  const [gallery, setGallery] = useState<GalleryRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    (async () => {
      const { data: mem } = await supabase.from('members').select('full_name').eq('id', user.id).maybeSingle();
      setName(mem?.full_name || user.email || 'Member');

      const { data: imgs } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_visible', true)
        .eq('is_members_only', true)
        .order('created_at', { ascending: false });

      setGallery(imgs ?? []);

      const { data: ann } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setAnnouncements(ann ?? []);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl font-black text-gray-900">Members area</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-semibold text-[#2E75B6]">{name}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-600 border border-gray-200 rounded-full hover:bg-white"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="px-4 py-2 text-sm font-bold uppercase tracking-wider bg-[#2E75B6] text-white rounded-full hover:bg-[#1F4E78]"
            >
              Sign out
            </button>
          </div>
        </div>

        <section className="grid md:grid-cols-2 gap-6 mb-12">
          <a
            href={REG_PDF}
            download="TOPAZ-Registration-Form.pdf"
            className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#2E75B6]/40 transition-colors"
          >
            <h2 className="font-bold text-lg text-gray-900 mb-2">Registration form (PDF)</h2>
            <p className="text-sm text-gray-600">Download the official registration form.</p>
          </a>
          <a
            href={RULES_PDF}
            download="TOPAZ_Rules_2026.pdf"
            className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#2E75B6]/40 transition-colors"
          >
            <h2 className="font-bold text-lg text-gray-900 mb-2">Competition rules (PDF)</h2>
            <p className="text-sm text-gray-600">Member copy of the rules document.</p>
          </a>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-black text-gray-900 mb-4">Notice board</h2>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-gray-500 text-sm">No announcements yet. Check back soon.</p>
            ) : (
              announcements.map((a) => (
                <article key={a.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{a.body}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-black text-gray-900 mb-2">Member-only gallery</h2>
          <p className="text-sm text-gray-600 mb-6">
            Photos marked members-only by Nick appear here (not on the public gallery page).
          </p>
          {gallery.length === 0 ? (
            <p className="text-gray-500 text-sm">No member-only photos yet.</p>
          ) : (
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
              <Masonry gutter="16px">
                {gallery.map((img) => (
                  <div key={img.id} className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                    <img src={img.url} alt={img.caption || ''} className="w-full h-auto object-contain" />
                    {img.caption ? (
                      <p className="text-xs text-gray-600 p-2">{img.caption}</p>
                    ) : null}
                  </div>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          )}
        </section>
      </div>
    </div>
  );
}
