-- Seed extended site_content keys for admin-managed imagery sitewide.
-- Paths mirror app fallbacks (Vite public assets use leading slash; BASE_URL is often '/').

INSERT INTO public.site_content (key, value, updated_at) VALUES
  ('home_official_banner', '/images/homepage/topaz-2-0-banner.png', now()),
  ('home_promo_masterclass', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=600&fit=crop', now()),
  ('home_promo_sponsors', 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=600&fit=crop', now()),
  ('home_promo_panel', 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=600&fit=crop', now()),
  ('home_hero_emblem', '/images/logos/topaz-logo-masks.png', now()),
  ('about_image_1', '/images/gallery/topaz-legacy-photo-img284.jpg', now()),
  ('about_image_2', '/images/about/Screenshot_20260401_140745.jpg', now()),
  ('about_image_3', '/images/gallery/history/stage-colorful-trio-vegas.jpg', now()),
  ('about_hero_background', 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&h=900&fit=crop', now()),
  ('about_ric_portrait', '/about/ric-heath.png', now()),
  ('about_team_photo', '/about/meet-the-team.jpg', now()),
  ('about_us_fallback', '/about/about-us.jpg', now()),
  ('schedule_hero_background', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop', now()),
  ('schedule_event_card_image', '/images/events/trophy-gold.jpg', now()),
  ('schedule_card_error_fallback', 'https://images.unsplash.com/photo-1569516449774-7a7b4d84a0d8?w=1200&q=80', now()),
  ('rules_hero_background', 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&h=900&fit=crop', now()),
  ('rules_cta_background', 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=1600&h=900&fit=crop', now()),
  ('contact_hero_background', 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&h=900&fit=crop', now()),
  ('gallery_hero_background', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop', now()),
  ('shop_hero_background', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop', now()),
  ('registration_hero_background', 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=2000&auto=format&fit=crop', now())
ON CONFLICT (key) DO NOTHING;
