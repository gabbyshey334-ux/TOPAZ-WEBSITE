import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { X } from 'lucide-react';
import { format } from 'date-fns';

type MemberRow = Database['public']['Tables']['members']['Row'];
type GalleryRow = Database['public']['Tables']['gallery_images']['Row'];
type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];

const BASE = import.meta.env.BASE_URL;

export default function MembersDashboard() {
  const { user, signOut } = useAuth();
  const { event, loading: eventLoading } = useActiveEvent();
  const [member, setMember] = useState<MemberRow | null>(null);
  const [gallery, setGallery] = useState<GalleryRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [lightbox, setLightbox] = useState<GalleryRow | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: m }, { data: g }, { data: a }] = await Promise.all([
      supabase.from('members').select('*').eq('id', user.id).maybeSingle(),
      supabase
        .from('gallery_images')
        .select('*')
        .eq('is_members_only', true)
        .eq('is_visible', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
    ]);
    setMember(m != null ? (m as MemberRow) : null);
    setGallery((g as GalleryRow[]) ?? []);
    setAnnouncements((a as AnnouncementRow[]) ?? []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSignOut() {
    await signOut();
    window.location.href = '/';
  }

  const regPdf = `${BASE}pdfs/topaz-registration-form.pdf`;
  const rulesPdf = `${BASE}pdfs/topaz-rules.pdf`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight">
              Welcome{member?.full_name ? `, ${member.full_name}` : ''}
            </h1>
            {member?.studio_name ? (
              <p className="text-slate-400 mt-1">{member.studio_name}</p>
            ) : null}
          </div>
          <Button
            variant="outline"
            className="border-slate-600 text-white shrink-0"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-[#2E75B6] mb-4">
            Competition info
          </h2>
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {eventLoading ? 'Loading…' : event?.name ?? 'Upcoming competition'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-300">
              {event ? (
                <>
                  <p>
                    <span className="text-slate-500">Date: </span>
                    {event.date ? format(new Date(event.date + 'T12:00:00'), 'MMMM d, yyyy') : '—'}
                  </p>
                  <p>
                    <span className="text-slate-500">Location: </span>
                    {event.location}
                  </p>
                  {event.description ? (
                    <p className="text-sm leading-relaxed pt-2 whitespace-pre-wrap">{event.description}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-slate-500">Event details will appear here when available.</p>
              )}
              <Button asChild className="mt-4 bg-[#2E75B6] hover:bg-[#1F4E78]">
                <Link to="/registration">Register now</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-[#2E75B6] mb-4">
            Documents
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-slate-600 text-white">
              <a href={regPdf} download="TOPAZ-Registration-Form.pdf">
                Registration form (PDF)
              </a>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white">
              <a href={rulesPdf} download="TOPAZ_Rules_2026.pdf">
                Rules (PDF)
              </a>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-[#2E75B6] mb-4">
            Members gallery
          </h2>
          {gallery.length === 0 ? (
            <p className="text-slate-500 text-sm">No exclusive content yet — check back soon.</p>
          ) : (
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
              <Masonry gutter="16px">
                {gallery.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setLightbox(img)}
                    className="block w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
                  >
                    <img src={img.url} alt={img.caption ?? img.filename} className="w-full h-auto object-cover" />
                  </button>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-[#2E75B6] mb-4">
            Announcements
          </h2>
          {announcements.length === 0 ? (
            <p className="text-slate-500 text-sm">No announcements yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {announcements.map((ann) => (
                <Card key={ann.id} className="bg-slate-900/80 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-white">{ann.title}</CardTitle>
                    <p className="text-xs text-slate-500">
                      {format(new Date(ann.created_at), 'MMM d, yyyy')}
                    </p>
                  </CardHeader>
                  <CardContent className="text-slate-300 text-sm whitespace-pre-wrap">{ann.body}</CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            aria-label="Close"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.caption ?? lightbox.filename}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
