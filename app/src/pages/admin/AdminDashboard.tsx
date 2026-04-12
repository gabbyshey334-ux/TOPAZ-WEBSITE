import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  ImageIcon,
  Calendar,
  ShoppingBag,
  Settings,
  Users,
  Bell,
} from 'lucide-react';

import OverviewTab from '@/pages/admin/tabs/OverviewTab';
import RegistrationsAdmin from '@/pages/admin/tabs/RegistrationsAdmin';
import GalleryTab from '@/pages/admin/tabs/GalleryTab';
import EventsTab from '@/pages/admin/tabs/EventsTab';
import MembersTab from '@/pages/admin/tabs/MembersTab';
import AnnouncementsTab from '@/pages/admin/tabs/AnnouncementsTab';
import ShopTab from '@/pages/admin/tabs/ShopTab';
import SettingsTab from '@/pages/admin/tabs/SettingsTab';

type TabId = 'overview' | 'registrations' | 'gallery' | 'events' | 'members' | 'announcements' | 'shop' | 'settings';

const NAV: { id: TabId; label: string; shortLabel: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview',       label: 'Overview',       shortLabel: 'Home',   icon: LayoutDashboard },
  { id: 'registrations',  label: 'Registrations',  shortLabel: 'Regs',   icon: ClipboardList },
  { id: 'gallery',        label: 'Gallery',        shortLabel: 'Gallery', icon: ImageIcon },
  { id: 'events',         label: 'Events',         shortLabel: 'Events', icon: Calendar },
  { id: 'members',        label: 'Members',        shortLabel: 'Members', icon: Users },
  { id: 'announcements',  label: 'Announcements',  shortLabel: 'News',   icon: Bell },
  { id: 'shop',           label: 'Shop',           shortLabel: 'Shop',   icon: ShoppingBag },
  { id: 'settings',       label: 'Settings',       shortLabel: 'More',   icon: Settings },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>('overview');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">

      {/* ── Desktop sidebar (lg+) ──────────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-slate-800 fixed h-full overflow-y-auto py-8 px-4">
        <Link
          to="/"
          className="font-display font-black text-xl uppercase tracking-tight px-3 mb-10 hover:opacity-80 transition-opacity"
        >
          TOPAZ<span className="text-[#2E75B6]">2.0</span>
        </Link>

        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-3 mb-3">
          Admin
        </p>

        <nav className="space-y-0.5 flex-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left',
                tab === item.id
                  ? 'bg-[#2E75B6] text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <p className="text-[10px] text-slate-600 px-3 mt-6">TOPAZ 2.0 Admin</p>
      </aside>

      {/* ── Main content area ──────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-56 min-h-screen pb-24 lg:pb-8 overflow-x-hidden">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-display font-black text-lg uppercase tracking-tight">
            TOPAZ<span className="text-[#2E75B6]">2.0</span>
          </Link>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            {NAV.find((n) => n.id === tab)?.label}
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-10">
          {tab === 'overview'       && <OverviewTab onNavigate={setTab} />}
          {tab === 'registrations'  && <RegistrationsAdmin />}
          {tab === 'gallery'        && <GalleryTab />}
          {tab === 'events'         && <EventsTab />}
          {tab === 'members'        && <MembersTab />}
          {tab === 'announcements'  && <AnnouncementsTab />}
          {tab === 'shop'           && <ShopTab />}
          {tab === 'settings'       && <SettingsTab />}
        </div>
      </main>

      {/* ── Mobile bottom tab bar (< lg) — 8 items at ~49px each on 390px ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0a] border-t border-slate-800 flex">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors min-w-0',
              tab === item.id ? 'text-[#2E75B6]' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="text-[8px] font-medium leading-none truncate w-full text-center px-0.5">{item.shortLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
