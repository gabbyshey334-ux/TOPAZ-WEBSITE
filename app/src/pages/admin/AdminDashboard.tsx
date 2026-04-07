import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  ClipboardList,
  ImageIcon,
  Video,
  Users,
  Calendar,
  Megaphone,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import RegistrationsAdmin from '@/pages/admin/tabs/RegistrationsAdmin';
import GalleryImagesTab from '@/pages/admin/tabs/GalleryImagesTab';
import GalleryVideosTab from '@/pages/admin/tabs/GalleryVideosTab';
import MembersTab from '@/pages/admin/tabs/MembersTab';
import EventsTab from '@/pages/admin/tabs/EventsTab';
import AnnouncementsTab from '@/pages/admin/tabs/AnnouncementsTab';

type TabId =
  | 'registrations'
  | 'gallery-photos'
  | 'gallery-videos'
  | 'members'
  | 'events'
  | 'announcements';

const nav: { id: TabId; label: string; icon: typeof ClipboardList }[] = [
  { id: 'registrations', label: 'Registrations', icon: ClipboardList },
  { id: 'gallery-photos', label: 'Gallery Photos', icon: ImageIcon },
  { id: 'gallery-videos', label: 'Gallery Videos', icon: Video },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>('registrations');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className="w-64 shrink-0 border-r border-slate-800 flex flex-col py-8 px-4">
        <Link to="/" className="font-display font-black text-lg uppercase px-3 mb-10">
          TOPAZ<span className="text-[#2E75B6]">2.0</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-3 mb-3">
          Admin
        </span>
        <nav className="space-y-1 flex-1">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left',
                tab === item.id
                  ? 'bg-[#2E75B6] text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="justify-start text-slate-400 hover:text-white hover:bg-slate-900"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </aside>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8 lg:p-10">
          {tab === 'registrations' && <RegistrationsAdmin />}
          {tab === 'gallery-photos' && <GalleryImagesTab />}
          {tab === 'gallery-videos' && <GalleryVideosTab />}
          {tab === 'members' && <MembersTab />}
          {tab === 'events' && <EventsTab />}
          {tab === 'announcements' && <AnnouncementsTab />}
        </div>
      </div>
    </div>
  );
}
