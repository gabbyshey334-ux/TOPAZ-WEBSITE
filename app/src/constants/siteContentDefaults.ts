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

/** FAQ item shape for JSON lists (`contact_faq_json`, `registration_faq_json`). */
export type SiteFaqItem = { question: string; answer: string };

export const CONTACT_PAGE_FAQ_DEFAULTS: SiteFaqItem[] = [
  {
    question: 'How do I register for a competition?',
    answer:
      'Download the registration PDF from our Registration page, complete it, and email it to topaz2.0@yahoo.com. Registration opens April 1, 2026. Submit before the deadline of July 30, 2026, 12:00 AM. See Registration for full instructions.',
  },
  {
    question: 'What is the registration deadline?',
    answer:
      'For The Return of TOPAZ 2.0 (August 22, 2026), registration closes July 30, 2026, 12:00 AM. There is no late or day-of registration.',
  },
  {
    question: 'Can I compete in multiple categories?',
    answer:
      'Yes! Dancers are welcome to compete in multiple categories and divisions. Each entry requires a separate registration fee. Be sure to check the schedule to avoid time conflicts.',
  },
  {
    question: 'What should I bring to the competition?',
    answer:
      'Bring your costume, shoes, music backup (USB drive), registration confirmation, water, snacks, and any necessary makeup or hair supplies. Arrive at least 1 hour before your scheduled performance time.',
  },
  {
    question: 'How is the scoring system work?',
    answer:
      'Performances are judged on four criteria: Technique (25 points), Creativity & Choreography (25 points), Presentation (25 points), and Appearance & Costume (25 points), for a total of 100 points. Decimals are allowed for precise scoring.',
  },
  {
    question: 'What is the refund policy?',
    answer:
      'Full refunds are available up to 30 days before the competition. 50% refunds are available 15-29 days before. No refunds within 14 days of the event, but you may transfer your registration to another dancer.',
  },
];

export const REGISTRATION_PAGE_FAQ_DEFAULTS: SiteFaqItem[] = [
  {
    question: 'When does registration open?',
    answer:
      'Registration opens April 1, 2026. All completed forms must be submitted before the deadline of July 30, 2026, 12:00 AM.',
  },
  {
    question: 'Can I register on competition day?',
    answer:
      'No. All registrations must be received before July 30, 2026, 12:00 AM. NO day-of-event registration is accepted. Plan ahead and submit in time.',
  },
  {
    question: 'Can I register multiple entries?',
    answer:
      'Yes. Submit a separate registration form for each routine before the deadline. Fees are per entry or per person as listed in the Entry Fees section and on the official PDF.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept cash, check, credit card, and PayPal. Checks should be made payable to Topaz 2.0 LLC.',
  },
  {
    question: 'Can I make changes after submitting?',
    answer:
      'Yes, please contact us at topaz2.0@yahoo.com before the registration deadline (July 30, 2026, 12:00 AM) to request changes to your entry.',
  },
  {
    question: 'What if I miss the deadline?',
    answer:
      'Registrations are not accepted after the deadline. All entries must be received before July 30, 2026, 12:00 AM. There are no exceptions and no late or day-of-event registration.',
  },
  {
    question: 'Do I need to register for each category separately?',
    answer: 'Yes, each routine requires a separate registration form for proper scheduling and judging.',
  },
];

/**
 * Parse `[{ "question": "...", "answer": "..." }]` from `site_content`.
 * Invalid or empty JSON falls back to `hardcodedDefaults`.
 */
export function faqListFromSiteContentJson(
  map: Record<string, string | null | undefined>,
  jsonKey: 'contact_faq_json' | 'registration_faq_json',
  hardcodedDefaults: SiteFaqItem[],
): SiteFaqItem[] {
  const raw = map[jsonKey];
  const s = raw != null ? String(raw).trim() : '';
  if (!s) return hardcodedDefaults;
  try {
    const parsed = JSON.parse(s) as unknown;
    if (!Array.isArray(parsed)) return hardcodedDefaults;
    const out: SiteFaqItem[] = [];
    for (const item of parsed) {
      if (item && typeof item === 'object') {
        const q = 'question' in item && typeof (item as { question: unknown }).question === 'string'
          ? (item as { question: string }).question.trim()
          : '';
        const a = 'answer' in item && typeof (item as { answer: unknown }).answer === 'string'
          ? (item as { answer: string }).answer.trim()
          : '';
        if (q && a) out.push({ question: q, answer: a });
      }
    }
    return out.length ? out : hardcodedDefaults;
  } catch {
    return hardcodedDefaults;
  }
}

/** Default copy for `site_content` text keys (used when row missing or value is blank). */
export const SITE_CONTENT_TEXT_DEFAULTS = {
  home_hero_title: 'TOPAZ 2.0',
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
  rules_ballet_note:
    'Rosin powder will NOT be supplied by TOPAZ 2.0. Dancers must bring their own.',
  rules_general_note: '',

  footer_tagline:
    'The premier dance competition since 1972. Creating unforgettable moments for dancers nationwide. Excellence in dance, built by dancers, for dancers.',
  footer_address: 'PO BOX 131, BANKS, OR 97106',
  footer_copyright: '© 2026 TOPAZ 2.0 LLC. All rights reserved.',
  footer_est_line: 'EST. 1972 • EXCELLENCE IN DANCE',
  footer_social_facebook_url: 'https://www.facebook.com/profile.php?id=61583857120063',
  footer_social_twitter_url: 'https://x.com/0topaz20',
  footer_social_instagram_url: 'https://instagram.com/dancetopaz2.0',
  footer_social_tiktok_url: 'https://www.tiktok.com/@dancetopaz2.0',

  home_heritage_1_alt: 'Vintage TOPAZ competition — young dancer in tuxedo with trophy',
  home_heritage_2_alt: 'Vintage TOPAZ competition — duo with trophy',
  home_heritage_3_alt: 'Vintage TOPAZ competition — group of dancers with trophy',
  home_heritage_4_alt: '1975 newspaper clipping featuring TOPAZ',
  home_whats_coming_kicker: "What's Coming",
  home_whats_coming_heading: 'Exciting Features Ahead',
  home_promo_1_title: 'MASTER CLASSES',
  home_promo_1_subtitle: 'COMING SOON',
  home_promo_1_description: 'Learn from industry professionals',
  home_promo_2_title: 'SPONSORS',
  home_promo_2_subtitle: 'COMING SOON',
  home_promo_2_description: 'Partner with excellence',
  home_promo_3_title: 'PANEL & JUDGES',
  home_promo_3_subtitle: 'COMING SOON',
  home_promo_3_description: 'Expert adjudication panel',
  home_masterclass_kicker: 'Master Classes',
  home_masterclass_heading_main: 'Learn from ',
  home_masterclass_heading_accent: 'Industry Pros',
  home_judges_kicker: 'Panel & Judges',
  home_judges_heading_main: 'Our ',
  home_judges_heading_accent: 'Adjudicators',
  home_official_banner_alt: 'TOPAZ 2.0 Dance and Performing Arts Competition banner',
  home_legacy_kicker: 'Why Choose TOPAZ',
  home_legacy_heading_main: 'TOPAZ ',
  home_legacy_heading_accent: 'Legacy',
  home_legacy_subheading:
    'Over three decades of nurturing talent, building community, and creating unforgettable moments in theatrical arts.',
  home_legacy_card_1_title: 'PRESTIGIOUS AWARDS',
  home_legacy_card_1_body:
    'Our unique cumulative scoring system lets dancers earn bronze, silver, and gold medals as they progress through the competition season.',
  home_legacy_card_2_title: 'INCLUSIVE COMMUNITY',
  home_legacy_card_2_body:
    'Welcoming dancers of all ages, backgrounds, and skill levels in a supportive and inspiring environment.',
  home_tour_eyebrow: 'The Return Of',
  home_tour_title_prefix: 'TOPAZ ',
  home_tour_title_accent: '2.0',
  home_tour_register_btn: 'REGISTER NOW',
  home_testimonials_kicker: 'What Studios Say',
  home_testimonials_heading: 'TESTIMONIALS',
  home_testimonials_empty_body:
    'Testimonials will appear here after the competition season. Check back soon to read comments from our students and participants.',
  home_final_cta_kicker: 'Join The Legacy',
  home_final_cta_heading_prefix: 'READY TO TAKE THE ',
  home_final_cta_heading_accent: 'STAGE?',
  home_final_cta_body:
    'Join thousands of dancers who have made TOPAZ their home. Register today and start your journey to excellence.',
  home_final_cta_primary_btn: 'REGISTER NOW',
  home_final_cta_secondary_btn: 'CONTACT US',

  about_hero_badge: 'Established 1972',
  about_page_title_main: 'About ',
  about_page_title_accent: 'Us',
  about_hero_subtitle:
    'Over three decades of nurturing talent, building community, and creating unforgettable moments in theatrical arts.',
  about_story_kicker: 'The Founders',
  about_story_heading_main: 'Our ',
  about_story_heading_accent: 'Story',
  about_legacy_quote:
    'Topaz alumni have had the incredible opportunity to perform alongside legends like Cher, Michael Jackson, Madonna, and The Pointer Sisters, captivating audiences around the globe.',
  about_ric_blurb:
    'Ric Heath, alongside his brother Randy, helps guide TOPAZ forward—honoring the foundation Pat and Bob built and the community they inspired.',
  about_ric_name: 'Ric Heath',
  about_ric_portrait_alt: 'Ric Heath',
  about_image_2_alt: 'Vintage black and white duo — man in military-style hat with woman',
  about_image_3_alt: 'TOPAZ performers in colorful green and pink costumes on stage',
  about_image_1_caption: 'About Us',
  about_image_2_caption: 'Continuing the Dream',
  about_image_3_caption: 'Bob and Pat — TOPAZ Founders',
  about_next_gen_kicker: 'The Next Generation',
  about_next_gen_heading_main: 'Continuing the ',
  about_next_gen_heading_accent: 'Dream',
  about_tribute_text:
    'Though we mourn the loss of Bob in 2023, Pat remains passionate about Topaz and is currently enjoying her time in Las Vegas.',
  about_heritage_kicker: 'Through The Years',
  about_heritage_heading_main: 'TOPAZ ',
  about_heritage_heading_accent: 'Heritage',
  about_team_heading: 'Meet The|Team',
  about_team_role_vp: 'Vice President',
  about_team_role_founder: 'Founder',
  about_team_role_president: 'President',
  about_team_image_alt: 'TOPAZ team with banner',
  about_about_us_heading: 'About Us',
  about_about_us_image_alt:
    'Pat and Bob Heath dancing — striped dance pants and performance wear',
  about_cta_heading_prefix: 'Be Part of the ',
  about_cta_heading_accent: 'Legacy',
  about_cta_body:
    'Join thousands of dancers who have made TOPAZ their home. Experience the magic of theatrical arts competition.',
  about_cta_register: 'Register Now',
  about_cta_gallery: 'View Gallery',

  contact_hero_kicker: 'Connect With Us',
  contact_hero_heading_prefix: 'Get in ',
  contact_hero_heading_accent: 'Touch',
  contact_form_heading_prefix: 'Send Us a ',
  contact_form_heading_accent: 'Message',
  contact_form_intro:
    'Have questions about registration, categories, or our events? Fill out the form below and our team will get back to you within 24 hours.',
  contact_details_heading_prefix: 'Contact ',
  contact_details_heading_accent: 'Details',
  contact_card_email_title: 'Email Us',
  contact_card_email_action: 'Send Email',
  contact_card_phone_title: 'Call Us',
  contact_card_phone_action: 'Call Now',
  contact_mail_address: 'PO BOX 131\nBANKS, OR 97106',
  contact_card_mail_title: 'Mail Us',
  contact_card_mail_action: 'Get Directions',
  contact_social_heading_prefix: 'Follow the ',
  contact_social_heading_accent: 'Movement',
  contact_social_body:
    'Follow @dancetopaz2.0 on TikTok for updates and behind-the-scenes content.',
  contact_faq_section_heading_prefix: 'Common ',
  contact_faq_section_heading_accent: 'Questions',
  contact_faq_section_intro:
    "Find instant answers to our most frequently asked questions. Can't find what you're looking for? Reach out above.",

  schedule_hero_kicker: 'Season 2026',
  schedule_hero_heading_prefix: 'Competition ',
  schedule_hero_heading_accent: 'Events',
  schedule_upcoming_heading: 'Upcoming Competitions',
  schedule_upcoming_subtitle: "Don't miss your chance to shine on the TOPAZ stage.",
  schedule_cta_heading_prefix: 'Ready to ',
  schedule_cta_heading_accent: 'Compete?',
  schedule_cta_body:
    'Register early to secure your spot and take advantage of early bird pricing. Join the TOPAZ family today.',
  schedule_cta_rules_btn: 'View Competition Rules',
  schedule_cta_top_btn: 'Back to Top',
  schedule_fallback_event_name: 'The Return of TOPAZ 2.0',
  schedule_fallback_subtitle: 'Join us for the return of TOPAZ 2.0',
  schedule_fallback_date: 'Saturday, August 22, 2026',
  schedule_fallback_time: '8:00 AM – 12:00 PM',
  schedule_fallback_location: 'Seaside Convention Center',
  schedule_fallback_address: '415 1st Ave, Seaside, OR 97138',
  schedule_fallback_deadline: 'July 30, 2026, 12:00 AM',

  rules_hero_kicker: 'Standards of Excellence',
  rules_hero_title_main: 'Rules & ',
  rules_hero_title_accent: 'Regulations',
  rules_hero_lead:
    'Official TOPAZ 2.0 competition rules—categories, divisions, scoring, and policies ensuring a professional environment.',

  shop_hero_kicker: 'Official Merchandise',
  shop_hero_heading_prefix: 'Explore the ',
  shop_hero_heading_accent: 'Collection',
  shop_hero_subtitle_in_stock: 'Order your exclusive TOPAZ 2.0 gear today!',
  shop_hero_subtitle_empty: 'Pre-order your exclusive TOPAZ 2.0 gear — coming soon!',
  shop_featured_heading: 'Featured Items',
  shop_empty_title: 'Online Store Coming Soon!',
  shop_empty_body:
    'Our online merchandise store is currently being set up. For now, you can purchase items at our competitions or pre-order via email.',
  shop_empty_cta_line: 'Want to pre-order? Contact us at',
  shop_merch_cta_heading: 'Questions about merchandise?',
  shop_merch_cta_subtitle: 'Need help with sizing or bulk orders for your studio?',
  shop_merch_cta_btn: 'Contact Us',

  registration_hero_badge: 'Season 2026',
  registration_hero_title_line1: 'Secure Your',
  registration_hero_title_accent: 'Spot',
  registration_hero_subtitle: 'The Return of TOPAZ 2.0 • August 22, 2026',
  registration_hero_location_line: 'Seaside Convention Center',
  registration_hero_primary_btn: 'Register Now',
  registration_hero_secondary_btn: 'Download Registration Form',
  registration_alert_window_title: 'Registration Window',
  registration_alert_window_body:
    'Opens April 1, 2026.\nCloses strictly on July 30, 2026 at 12:00 AM.\nNo exceptions or day-of registrations.',
  registration_alert_mail_title: 'Mailing Address',
  registration_alert_mail_body:
    'Mailing address is only required for certain competitions. You may leave address fields blank on the form if not applicable.',
  registration_process_heading_main: 'Registration ',
  registration_process_heading_accent: 'Process',
  registration_process_subtitle: 'Three simple steps to secure your spot on the stage.',
  registration_step1_title: 'Complete Form',
  registration_step1_body: 'Fill out the secure online registration form below, or download the PDF version.',
  registration_step2_title: 'Upload Media',
  registration_step2_body: 'Upload your high-quality performance music (MP3) directly through the form.',
  registration_step3_title: 'Submit & Pay',
  registration_step3_body:
    'Submit your registration and mail your entry fee (Cash, Check, or Money Order) to: TOPAZ 2.0, PO BOX 131, BANKS OR 97106. Must be received by registration close date (July 30, 2026).',

  gallery_hero_kicker: 'Memories',
  gallery_hero_title_prefix: 'Photo ',
  gallery_hero_title_accent: 'Gallery',
  gallery_tab_history: 'TOPAZ HISTORY',
  gallery_tab_topaz_title: 'TOPAZ 2.0',
  gallery_tab_topaz_sub: 'New competition era',
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
