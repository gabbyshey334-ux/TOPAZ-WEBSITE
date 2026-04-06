import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Images,
  Video,
  Users,
  CalendarDays,
  Megaphone,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import RegistrationsTab from './tabs/RegistrationsTab';
import GalleryImagesTab from './tabs/GalleryImagesTab';
import VideosTab from './tabs/VideosTab';
import MembersTab from './tabs/MembersTab';
import EventsTab from './tabs/EventsTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';

export type AdminSection =
  | 'registrations'
  | 'gallery'
  | 'videos'
  | 'members'
  | 'events'
  | 'announcements';

const nav: { id: AdminSection; label: string; icon: typeof ClipboardList }[] = [
  { id: 'registrations', label: 'Registrations', icon: ClipboardList },
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
];

export default function AdminDashboard() {
  const [section, setSection] = useState<AdminSection>('registrations');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-56 shrink-0 border-r border-white/10 bg-black/40 p-4 flex flex-col">
        <Link to="/" className="font-display font-black text-lg text-white mb-8 px-2">
          TOPAZ<span className="text-[#2E75B6]">2.0</span>
          <span className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mt-1">Admin</span>
        </Link>
        <nav className="space-y-1 flex-1">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={cn(
                'w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                section === item.id ? 'bg-[#2E75B6] text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="justify-start text-white/60 hover:text-white hover:bg-white/10 mt-4"
          onClick={async () => {
            await signOut();
            navigate('/admin/login', { replace: true });
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </aside>
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-10 max-w-6xl">
          {section === 'registrations' ? <RegistrationsTab /> : null}
          {section === 'gallery' ? <GalleryImagesTab /> : null}
          {section === 'videos' ? <VideosTab /> : null}
          {section === 'members' ? <MembersTab /> : null}
          {section === 'events' ? <EventsTab /> : null}
          {section === 'announcements' ? <AnnouncementsTab /> : null}
        </div>
      </div>
    </div>
  );
}
