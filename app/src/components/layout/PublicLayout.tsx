import { useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { siteContentUrl, type SiteContentMediaKey } from '@/constants/siteContentDefaults';
import { useSiteContentMap } from '@/contexts/SiteContentContext';

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
  // The background URL comes from a single global fetch (SiteContentProvider).
  // Because it's shared across every route, the URL is stable from the first
  // paint of the very first page, and never changes on subsequent navigations.
  // That's what kills the per-page hero "switch" effect.
  const map = useSiteContentMap();
  const layoutBgUrl = useMemo(() => siteContentUrl(map, LAYOUT_BG_KEY), [map]);

  // Warm the browser cache for the background image so the very first paint
  // on a hard refresh isn't a brief #0a0a0a flash.
  useEffect(() => {
    if (!layoutBgUrl) return;
    const img = new Image();
    img.src = layoutBgUrl;
  }, [layoutBgUrl]);

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
