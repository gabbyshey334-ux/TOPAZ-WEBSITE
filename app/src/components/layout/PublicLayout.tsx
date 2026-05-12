import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { supabase } from '@/lib/supabase';
import { rowsToSiteContentMap, siteContentUrl, type SiteContentMediaKey } from '@/constants/siteContentDefaults';

const LAYOUT_BG_KEY = 'public_layout_background' satisfies SiteContentMediaKey;

/**
 * Single fixed background layer combining the photo and the dark dim
 * gradient. Kept as a sibling of <Outlet/> so it never re-mounts on
 * route changes — that re-mount was the source of the navigation
 * "flash" between pages.
 */
function LayoutBackground({ url }: { url: string }) {
  const dim = 'linear-gradient(to bottom, rgba(10,10,10,0.82), rgba(10,10,10,0.88))';
  const image = url ? `, url(${url})` : '';
  return (
    <div
      className="pointer-events-none"
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundColor: '#0a0a0a',
        backgroundImage: `${dim}${image}`,
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
        willChange: 'transform',
      }}
    />
  );
}

export default function PublicLayout() {
  // Initial value comes from the static defaults map so the first paint
  // already shows the correct image — no late-fetch swap that would flash.
  const [layoutBgUrl, setLayoutBgUrl] = useState(() => siteContentUrl({}, LAYOUT_BG_KEY));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('site_content').select('key, value').order('key');
      if (cancelled) return;
      const map = rowsToSiteContentMap(data as { key: string; value: string | null }[] | null);
      const next = siteContentUrl(map, LAYOUT_BG_KEY);
      // Only set state when the URL actually differs to avoid an extra
      // render / layer repaint that can manifest as a brief flash.
      setLayoutBgUrl((prev) => (prev === next ? prev : next));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="layout-root min-h-screen"
      style={{ position: 'relative', backgroundColor: '#0a0a0a' }}
    >
      <LayoutBackground url={layoutBgUrl} />
      <div
        className="content-layer flex min-h-screen flex-col"
        style={{ position: 'relative', zIndex: 1 }}
      >
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
