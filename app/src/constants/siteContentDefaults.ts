/**
 * Default URLs for `site_content` keys (used when DB row is missing or empty).
 * BASE_URL is fixed at module load for Vite builds.
 */
const BASE = import.meta.env.BASE_URL;

export const SITE_CONTENT_DEFAULTS = {
  // Homepage
  hero_image_1: `${BASE}images/homepage/boy-tuxedo-trophy.png`,
  hero_image_2: `${BASE}images/homepage/duo-trophy.png`,
  hero_image_3: `${BASE}images/homepage/group-dancers-trophy.png`,
  hero_image_4: `${BASE}images/homepage/newspaper-1975.png`,
  hero_video_url:
    'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68/480p/mp4/file.mp4',
  home_official_banner: `${BASE}images/homepage/topaz-2-0-banner.png`,
  home_promo_masterclass: `${BASE}images/homepage/duo-trophy.png`,
  home_promo_sponsors: `${BASE}images/homepage/group-dancers-trophy.png`,
  home_promo_panel: `${BASE}images/homepage/boy-tuxedo-trophy.png`,
  home_hero_emblem: `${BASE}images/logos/topaz-logo-masks.png`,
  // About
  about_image_1: `${BASE}images/gallery/topaz-legacy-photo-img284.jpg`,
  about_image_2: `${BASE}images/about/Screenshot_20260401_140745.jpg`,
  about_image_3: `${BASE}images/gallery/history/stage-colorful-trio-vegas.jpg`,
  about_hero_background: `${BASE}images/homepage/topaz-2-0-banner.png`,
  about_ric_portrait: `${BASE}about/ric-heath.png`,
  about_team_photo: `${BASE}about/meet-the-team.jpg`,
  about_us_fallback: `${BASE}about/about-us.jpg`,
  // Schedule
  schedule_hero_background: `${BASE}images/homepage/topaz-2-0-banner.png`,
  schedule_event_card_image: `${BASE}images/events/trophy-gold.jpg`,
  schedule_card_error_fallback: `${BASE}images/events/trophy-gold.jpg`,
  // Rules
  rules_hero_background: `${BASE}images/homepage/topaz-2-0-banner.png`,
  rules_cta_background: `${BASE}images/homepage/group-dancers-trophy.png`,
  // Contact
  contact_hero_background: `${BASE}images/homepage/topaz-2-0-banner.png`,
  // Gallery
  gallery_hero_background: `${BASE}images/homepage/topaz-2-0-banner.png`,
  // Shop
  shop_hero_background: `${BASE}images/homepage/group-dancers-trophy.png`,
  // Registration
  registration_hero_background: `${BASE}images/homepage/topaz-2-0-banner.png`,
} as const satisfies Record<string, string>;

export type SiteContentMediaKey = keyof typeof SITE_CONTENT_DEFAULTS;

export function siteContentUrl(
  map: Record<string, string | null | undefined>,
  key: SiteContentMediaKey,
): string {
  const raw = map[key as string];
  const v = raw && String(raw).trim() ? String(raw).trim() : '';
  if (v) return v;
  return SITE_CONTENT_DEFAULTS[key];
}

export function rowsToSiteContentMap(
  rows: { key: string; value: string | null }[] | null | undefined,
): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const row of rows ?? []) {
    map[row.key] = row.value;
  }
  return map;
}
