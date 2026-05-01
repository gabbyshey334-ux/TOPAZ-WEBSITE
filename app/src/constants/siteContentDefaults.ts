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

/** Default copy for `site_content` text keys (used when row missing or value is blank). */
export const SITE_CONTENT_TEXT_DEFAULTS = {
  home_hero_title: 'The Return of TOPAZ 2.0',
  home_hero_subtitle: 'Dance and Performing Arts Competition',
  home_event_date: 'Saturday, August 22, 2026',
  home_event_location: 'Seaside Convention Center',
  about_our_story_text:
    'Pat and Bob Heath were visionaries in the world of theatrical arts, pioneering a competition framework that set a standard for excellence. Their innovative approach not only captured the imagination of audiences but also inspired countless others to adopt and adapt their model. With dedication and passion, their work continues to resonate, proving that great ideas can transcend time and influence generations.',
  about_us_text:
    "Topaz has proudly been at the forefront of theatrical arts competitions since 1972. Throughout the years and across numerous cities, we've built a vibrant community of countless studios and thousands of contestants who form our extended Topaz family. Many of the dedicated teachers who now inspire students were once competitors in our events, showcasing the lasting impact of our competitions. Join us in the love for the arts and the journey of growth that it fosters!",
  contact_phone: '971-299-4401',
  contact_email: 'topaz2.0@yahoo.com',
  schedule_event_description:
    'Event time: 8:00 AM – 12:00 PM. Registration opens April 1, 2026. Deadline: July 30, 2026, 12:00 AM.',
} as const satisfies Record<string, string>;

export type SiteContentTextKey = keyof typeof SITE_CONTENT_TEXT_DEFAULTS;

export function siteContentText(
  map: Record<string, string | null | undefined>,
  key: SiteContentTextKey,
): string {
  const raw = map[key as string];
  const v = raw != null ? String(raw).trim() : '';
  if (v) return v;
  return SITE_CONTENT_TEXT_DEFAULTS[key];
}

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
