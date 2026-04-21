import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  ImageIcon,
  Calendar,
  FileEdit,
  ShoppingBag,
  Settings,
  Users,
  Bell,
  LogOut,
  MoreHorizontal,
  X,
} from 'lucide-react';

import OverviewTab from '@/pages/admin/tabs/OverviewTab';
import RegistrationsAdmin from '@/pages/admin/tabs/RegistrationsAdmin';
import GalleryTab from '@/pages/admin/tabs/GalleryTab';
import EventsTab from '@/pages/admin/tabs/EventsTab';
import ContentTab from '@/pages/admin/tabs/ContentTab';
import MembersTab from '@/pages/admin/tabs/MembersTab';
import AnnouncementsTab from '@/pages/admin/tabs/AnnouncementsTab';
import ShopTab from '@/pages/admin/tabs/ShopTab';
import SettingsTab from '@/pages/admin/tabs/SettingsTab';

type TabId =
  | 'overview'
  | 'registrations'
  | 'gallery'
  | 'events'
  | 'content'
  | 'members'
  | 'announcements'
  | 'shop'
  | 'settings';

type NavItem = {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
};

// ── Nav groups — determine ordering on desktop sidebar and mobile bottom bar ──
const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Overview',
    items: [
      { id: 'overview', label: 'Overview', shortLabel: 'Home', icon: LayoutDashboard },
    ],
  },
  {
    heading: 'Manage',
    items: [
      { id: 'registrations', label: 'Registrations', shortLabel: 'Regs', icon: ClipboardList },
      { id: 'gallery',       label: 'Gallery',       shortLabel: 'Gallery', icon: ImageIcon },
      { id: 'events',        label: 'Events',        shortLabel: 'Events',  icon: Calendar },
      { id: 'content',       label: 'Content',       shortLabel: 'Content', icon: FileEdit },
    ],
  },
  {
    heading: 'Community',
    items: [
      { id: 'members',       label: 'Members',       shortLabel: 'Members', icon: Users },
      { id: 'announcements', label: 'Announcements', shortLabel: 'News',    icon: Bell },
      { id: 'shop',          label: 'Shop',          shortLabel: 'Shop',    icon: ShoppingBag },
    ],
  },
];

const SETTINGS_ITEM: NavItem = {
  id: 'settings',
  label: 'Settings',
  shortLabel: 'Settings',
  icon: Settings,
};

const ALL_ITEMS: NavItem[] = [
  ...NAV_GROUPS.flatMap((g) => g.items),
  SETTINGS_ITEM,
];

// Mobile bottom bar shows 4 primary + "More" overflow sheet
const MOBILE_PRIMARY: TabId[] = ['overview', 'registrations', 'gallery', 'events'];

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>('overview');
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  const primaryNav: NavItem[] = MOBILE_PRIMARY
    .map((id) => ALL_ITEMS.find((n) => n.id === id))
    .filter((n): n is NavItem => !!n);
  const overflowNav: NavItem[] = ALL_ITEMS.filter((n) => !MOBILE_PRIMARY.includes(n.id));

  const activeLabel = ALL_ITEMS.find((n) => n.id === tab)?.label ?? '';

  function selectMobile(id: TabId) {
    setTab(id);
    setMoreOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e7eb] flex">

      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-[#1e1e1e] fixed h-full bg-[#0a0a0a]">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 px-5 pt-8 pb-6 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E75B6] to-[#1F4E78] flex items-center justify-center shadow-[0_0_20px_rgba(46,117,182,0.35)] shrink-0">
            <span className="font-display font-black text-white text-lg leading-none">T</span>
          </div>
          <div className="font-display font-black text-lg uppercase tracking-tight text-white leading-none">
            TOPAZ<span className="text-[#2E75B6]">2.0</span>
          </div>
        </Link>

        {/* Scrollable nav region */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <nav className="space-y-6">
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.heading}>
                {gi > 0 && (
                  <div className="h-px bg-[#1e1e1e] mx-2 mb-4" aria-hidden />
                )}
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7280] px-3 mb-2">
                  {group.heading}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      active={tab === item.id}
                      onClick={() => setTab(item.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Settings pinned above user chip */}
        <div className="px-3 pt-3 border-t border-[#1e1e1e]">
          <NavButton
            item={SETTINGS_ITEM}
            active={tab === 'settings'}
            onClick={() => setTab('settings')}
          />
        </div>

        {/* User chip */}
        {user?.email && (
          <div className="px-3 py-3 border-t border-[#1e1e1e]">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-[#111111] border border-[#1e1e1e]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E75B6] to-[#1F4E78] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white uppercase">
                  {user.email[0]}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] leading-none">Admin</p>
                <p className="text-xs text-[#e5e7eb] truncate font-medium mt-1">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="shrink-0 p-1.5 rounded-md text-[#6b7280] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/40"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main content area ──────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-60 min-h-screen pb-24 lg:pb-8 overflow-x-hidden">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1e1e1e] px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2E75B6] to-[#1F4E78] flex items-center justify-center">
              <span className="font-display font-black text-white text-sm leading-none">T</span>
            </div>
            <span className="font-display font-black text-base uppercase tracking-tight text-white">
              TOPAZ<span className="text-[#2E75B6]">2.0</span>
            </span>
          </Link>
          <p className="text-[11px] text-[#e5e7eb] font-bold uppercase tracking-[0.15em]">
            {activeLabel}
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-10 lg:py-10">
          {tab === 'overview'       && <OverviewTab onNavigate={setTab} />}
          {tab === 'registrations'  && <RegistrationsAdmin />}
          {tab === 'gallery'        && <GalleryTab />}
          {tab === 'events'         && <EventsTab />}
          {tab === 'content'        && <ContentTab />}
          {tab === 'members'        && <MembersTab />}
          {tab === 'announcements'  && <AnnouncementsTab />}
          {tab === 'shop'           && <ShopTab />}
          {tab === 'settings'       && <SettingsTab />}
        </div>
      </main>

      {/* ── Mobile bottom tab bar ──────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-t border-[#1e1e1e] flex safe-bottom">
        {primaryNav.map((item) => (
          <MobileTab
            key={item.id}
            item={item}
            active={tab === item.id}
            onClick={() => setTab(item.id)}
          />
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors min-w-0',
            overflowNav.some((n) => n.id === tab)
              ? 'text-[#2E75B6]'
              : 'text-[#6b7280] hover:text-[#e5e7eb]'
          )}
        >
          <MoreHorizontal className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-bold uppercase tracking-wider leading-none">More</span>
        </button>
      </nav>

      {/* ── Mobile overflow sheet ──────────────────────────────────────────── */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end motion-reduce:animate-none animate-in fade-in duration-200"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden
          />
          <div
            className="relative w-full bg-[#1a1a1a] border-t border-[#2a2a2a] rounded-t-3xl p-4 pb-8 safe-bottom motion-reduce:animate-none animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-1 bg-[#2a2a2a] rounded-full" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b7280]">More</p>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center text-[#6b7280] hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {overflowNav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectMobile(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all',
                    tab === item.id
                      ? 'bg-[#2E75B6]/10 border-[#2E75B6]/40 text-[#2E75B6]'
                      : 'bg-[#111111] border-[#2a2a2a] text-[#e5e7eb] hover:border-[#3a3a3a]'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </div>

            {user?.email && (
              <div className="mt-5 pt-4 border-t border-[#2a2a2a] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2E75B6] to-[#1F4E78] flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white uppercase">{user.email[0]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] leading-none">Signed in</p>
                  <p className="text-xs text-[#e5e7eb] truncate font-medium mt-1">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setMoreOpen(false); handleSignOut(); }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar nav button with animated active indicator ──────────────────────────
function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative w-full flex items-center gap-3 rounded-lg pl-4 pr-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all text-left outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#2E75B6]/50',
        active
          ? 'text-white bg-[#2E75B6]/10 shadow-[0_0_12px_rgba(46,117,182,0.4)]'
          : 'text-[#6b7280] hover:text-[#e5e7eb] hover:bg-[#111111]'
      )}
    >
      {/* Animated left border indicator */}
      <span
        className={cn(
          'absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#2E75B6] origin-top transition-transform duration-300 ease-out motion-reduce:transition-none',
          active ? 'scale-y-100' : 'scale-y-0'
        )}
        aria-hidden
      />
      <Icon className={cn('w-4 h-4 shrink-0 transition-colors', active ? 'text-[#2E75B6]' : 'text-[#6b7280] group-hover:text-[#e5e7eb]')} />
      <span>{item.label}</span>
    </button>
  );
}

// ── Mobile bottom-bar button ───────────────────────────────────────────────────
function MobileTab({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors min-w-0',
        active ? 'text-[#2E75B6]' : 'text-[#6b7280] hover:text-[#e5e7eb]'
      )}
    >
      {active && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#2E75B6] rounded-b-full shadow-[0_0_12px_rgba(46,117,182,0.6)]" aria-hidden />
      )}
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-[9px] font-bold uppercase tracking-wider leading-none">{item.shortLabel}</span>
    </button>
  );
}
