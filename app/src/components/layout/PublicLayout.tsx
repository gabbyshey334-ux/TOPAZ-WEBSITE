import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { supabase } from '@/lib/supabase';
import { rowsToSiteContentMap, siteContentUrl, type SiteContentMediaKey } from '@/constants/siteContentDefaults';

const LAYOUT_BG_KEY = 'public_layout_background' satisfies SiteContentMediaKey;

export default function PublicLayout() {
  const [layoutBgUrl, setLayoutBgUrl] = useState(() => siteContentUrl({}, LAYOUT_BG_KEY));
  const siteContentFetched = useRef(false);

  useEffect(() => {
    if (siteContentFetched.current) return;
    siteContentFetched.current = true;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('site_content').select('key, value').order('key');
      if (cancelled) return;
      const map = rowsToSiteContentMap(data as { key: string; value: string | null }[] | null);
      setLayoutBgUrl(siteContentUrl(map, LAYOUT_BG_KEY));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="layout-root min-h-screen" style={{ position: 'relative' }}>
      <div
        className="background-layer pointer-events-none"
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundColor: '#0a0a0a',
          backgroundImage: layoutBgUrl ? `url(${layoutBgUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'opacity 0.15s ease-in-out',
        }}
      />
      <div
        className="background-dim pointer-events-none"
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.82), rgba(10,10,10,0.88))',
        }}
      />
      <div className="content-layer flex min-h-screen flex-col" style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <CartDrawer />
        <main className="flex-1 bg-transparent pt-20">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
