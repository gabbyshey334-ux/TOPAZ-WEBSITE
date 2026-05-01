-- Editable text keys for public pages (admin Content tab + site_content fallbacks).
INSERT INTO public.site_content (key, value, updated_at) VALUES
  ('home_hero_title', 'The Return of TOPAZ 2.0', now()),
  ('home_hero_subtitle', 'Dance and Performing Arts Competition', now()),
  ('home_event_date', 'Saturday, August 22, 2026', now()),
  ('home_event_location', 'Seaside Convention Center', now()),
  ('about_our_story_text', '', now()),
  ('about_us_text', '', now()),
  ('contact_phone', '971-299-4401', now()),
  ('contact_email', 'topaz2.0@yahoo.com', now()),
  ('rules_ballet_note', 'Pointe powder will NOT be supplied by TOPAZ 2.0. Dancers must bring their own.', now()),
  ('rules_general_note', '', now()),
  ('schedule_event_description', '', now())
ON CONFLICT (key) DO NOTHING;
